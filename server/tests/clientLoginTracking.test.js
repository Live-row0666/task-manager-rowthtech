const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { allowedPortalOrigin, loginMetadata } = require('../utils/clientLoginMetadata');
function load(relative, dependencies) {
    const context = { module: { exports: {} }, process: { env: {} }, console, Date, Set,
        require: name => name in dependencies ? dependencies[name] : require(name) };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, relative), 'utf8'), context);
    return context.module.exports;
}
function chain(result) {
    return { select() { return this; }, lean() { return this; }, populate() { return this; },
        sort() { return this; }, skip() { return this; }, limit() { return this; }, maxTimeMS: async () => result };
}
function response() { return { status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } }; }

test('portal origins are exact and localhost is excluded in production', () => {
    assert.equal(allowedPortalOrigin('http://localhost:3001', {}), 'http://localhost:3001');
    assert.equal(allowedPortalOrigin('https://taskmanagerclient.rowthtech.com', { NODE_ENV: 'production' }), 'https://taskmanagerclient.rowthtech.com');
    for (const origin of ['http://localhost:3001', 'https://taskmanagerclient.rowthtech.com.evil.test', 'null', undefined, 'https://taskmanagerclient.rowthtech.com/dashboard']) {
        assert.equal(allowedPortalOrigin(origin, { NODE_ENV: 'production' }), null);
    }
});

test('metadata ignores forged forwarding headers and validates browser timezone', () => {
    const req = { ip: '::ffff:192.0.2.1', headers: { 'x-forwarded-for': '8.8.8.8', 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0' }, body: { loginContext: { timezone: 'Asia/Kolkata' } } };
    const result = loginMetadata(req);
    assert.equal(result.ip, '192.0.2.1');
    assert.equal(result.browser, 'Edge 130.0.0.0');
    assert.equal(result.device, 'Desktop');
    assert.equal(result.os, 'Windows');
    assert.equal(result.reportedTimezone, 'Asia/Kolkata');
    req.body.loginContext.timezone = 'invalid';
    req.headers['user-agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile Safari/604.1';
    assert.equal(loginMetadata(req).reportedTimezone, '');
    assert.equal(loginMetadata(req).device, 'Mobile');
    assert.equal(loginMetadata(req).os, 'iOS');
});

test('only Client logins on allowed origins are recorded for assigned active managers', async () => {
    let saved;
    let userQuery;
    const { recordClientLogin } = load('../utils/clientLoginAudit.js', {
        '../models/project': { find: () => chain([{ _id: 'project-1', team: ['pm-1', 'dev-1'], createdBy: 'pm-1' }]) },
        '../models/role': { find: () => chain([{ _id: 'pm-role' }]) },
        '../models/user': { find: query => { userQuery = query; return chain([{ _id: 'pm-1' }]); } },
        '../models/clientLoginEvent': { create: async event => { saved = event; return event; } },
        './clientLoginMetadata': { allowedPortalOrigin, loginMetadata }
    });
    const req = { headers: { origin: 'http://localhost:3001' }, ip: '127.0.0.1', body: {} };
    const client = { _id: 'client-1', name: 'Test Client', loginEmail: 'client@example.test', role: { name: 'Client' } };
    await recordClientLogin(req, client);
    assert.deepEqual(Array.from(saved.recipients), ['pm-1']);
    assert.equal(saved.clientEmail, client.loginEmail);
    assert.equal(saved.location.source, 'unavailable');
    assert.equal(userQuery.isActive, true);
    assert.deepEqual(Array.from(userQuery.role.$in), ['pm-role']);
    assert.ok(saved.expiresAt.getTime() > Date.now());
    saved = null;
    await recordClientLogin(req, { ...client, role: { name: 'admin' } });
    assert.equal(saved, null);
    await recordClientLogin({ ...req, headers: { origin: 'https://other.example.test' } }, client);
    assert.equal(saved, null);
});

test('history rejects other roles and scopes managers to their current assigned projects', async () => {
    const queries = [];
    const { getClientLoginHistory } = load('../controllers/admin/clientLoginHistory.js', {
        '../../models/project': { find: () => chain([{ _id: 'project-1' }]) },
        '../../models/clientLoginEvent': { find: query => { queries.push(query); return chain([]); }, countDocuments: () => chain(0) }
    });
    let res = response();
    await getClientLoginHistory({ user: { role: { name: 'Support' } }, query: {} }, res);
    assert.equal(res.code, 403);
    assert.equal(queries.length, 0);
    res = response();
    await getClientLoginHistory({ user: { _id: 'pm-1', role: { name: 'Project Manager' } }, query: { limit: '5000' } }, res);
    assert.equal(queries[0].recipients, 'pm-1');
    assert.deepEqual(Array.from(queries[0].projects.$in), ['project-1']);
    assert.equal(res.data.limit, 50);
    assert.ok(queries[0].expiresAt.$gt instanceof Date);
});

test('login calls audit only after successful Client authentication and tolerates audit failure', async () => {
    let auditCalls = 0;
    let validPassword = true;
    let user = { _id: 'client-1', name: 'Client', role: { name: 'Client' }, password: 'hash', save: async () => {} };
    const auth = load('../controllers/client/auth.js', {
        '../../models/user': {}, '../../models/attendance': {},
        '../../models/client': { findOne: () => ({ select() { return this; }, populate: async () => user }) },
        '../../config/jwt': { generateToken: () => 'test-token' },
        '../../controllers/user/userActivityLog': {},
        '../../utils/encryption': { compare: () => validPassword },
        '../../config/nodemailer': {}, '../../templates/emailTemplates': {},
        '../../utils/clientLoginAudit': { recordClientLogin: async () => { auditCalls++; throw new Error('Simulated audit database failure'); } }
    });
    const req = { body: { email: 'client@example.test', password: 'test-password' } };
    let res = response();
    validPassword = false;
    await auth.login(req, res);
    assert.equal(res.code, 401);
    assert.equal(auditCalls, 0);
    validPassword = true;
    user.role.name = 'admin';
    res = response();
    await auth.login(req, res);
    assert.equal(res.code, 403);
    assert.equal(auditCalls, 0);
    user.role.name = 'Client';
    res = response();
    await auth.login(req, res);
    assert.equal(res.code, 200);
    assert.equal(res.data.token, 'test-token');
    assert.equal(auditCalls, 1);
});

const fs = require('node:fs');
const { Reader } = require('maxmind');
const Project = require('../models/project');
const User = require('../models/user');
const Role = require('../models/role');
const ClientLoginEvent = require('../models/clientLoginEvent');
const { allowedPortalOrigin, loginMetadata } = require('./clientLoginMetadata');

let geoReader;
function lookupLocation(ip) {
    if (!process.env.CLIENT_LOGIN_GEOIP_DB) return { source: 'unavailable' };
    if (geoReader === undefined) {
        try { geoReader = new Reader(fs.readFileSync(process.env.CLIENT_LOGIN_GEOIP_DB)); }
        catch (error) {
            geoReader = null;
            console.error('Client login GeoIP database could not be loaded:', error.message);
        }
    }
    let data = null;
    try { data = geoReader && ip ? geoReader.get(ip) : null; }
    catch (error) { console.error('Client login GeoIP lookup failed:', error.message); }
    return data ? {
        city: data.city?.names?.en || '', region: data.subdivisions?.[0]?.names?.en || '',
        country: data.country?.names?.en || '', source: 'local_geoip'
    } : { source: 'unavailable' };
}

async function recordClientLogin(req, client) {
    const portalOrigin = allowedPortalOrigin(req.headers.origin);
    if (!portalOrigin || client.role?.name !== 'Client') return;
    const projects = await Project.find({
        isActive: true,
        $or: [{ client: client._id }, { _id: { $in: client.projects || [] } }]
    }).select('_id team createdBy').lean().maxTimeMS(3000);
    const candidates = [...new Set(projects.flatMap(project => [...(project.team || []), project.createdBy])
        .filter(Boolean).map(String))];
    const roles = await Role.find({ name: 'Project Manager' }).select('_id').lean().maxTimeMS(3000);
    const managers = candidates.length ? await User.find({
        _id: { $in: candidates }, isActive: true, role: { $in: roles.map(role => role._id) }
    }).select('_id').lean().maxTimeMS(3000) : [];
    const metadata = loginMetadata(req);
    const retention = Number(process.env.CLIENT_LOGIN_RETENTION_DAYS || 90);
    const days = Number.isInteger(retention) && retention >= 1 && retention <= 365 ? retention : 90;
    return ClientLoginEvent.create({
        client: client._id, clientName: client.name, clientEmail: client.loginEmail,
        projects: projects.map(project => project._id), recipients: managers.map(manager => manager._id),
        portalOrigin, ...metadata, location: lookupLocation(metadata.ip),
        expiresAt: new Date(Date.now() + days * 86400000)
    });
}
module.exports = { recordClientLogin };

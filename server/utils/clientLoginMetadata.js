const { isIP } = require('node:net');

function allowedPortalOrigin(origin, env = process.env) {
    const defaults = env.NODE_ENV === 'production'
        ? 'https://taskmanagerclient.rowthtech.com'
        : 'http://localhost:3001,https://taskmanagerclient.rowthtech.com';
    const allowed = (env.CLIENT_LOGIN_PORTAL_ORIGINS || defaults).split(',').map(value => value.trim());
    try {
        const url = new URL(origin);
        // Origin headers must contain an origin, not credentials, paths or query strings.
        return url.origin === origin && allowed.includes(origin) ? origin : null;
    } catch { return null; }
}

function loginMetadata(req) {
    const ua = String(req.headers['user-agent'] || '').slice(0, 1024);
    const browserPatterns = [
        ['Edge', /(?:Edg|EdgA|EdgiOS)\/([\d.]+)/], ['Opera', /(?:OPR|OPiOS)\/([\d.]+)/],
        ['Firefox', /(?:Firefox|FxiOS)\/([\d.]+)/], ['Chrome', /(?:Chrome|CriOS)\/([\d.]+)/],
        ['Safari', /Version\/([\d.]+).*Safari/]
    ];
    let browser = 'Unknown';
    for (const [name, regex] of browserPatterns) {
        const match = ua.match(regex);
        if (match) { browser = `${name} ${match[1]}`; break; }
    }
    const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) ? 'iOS'
        : /Windows NT/i.test(ua) ? 'Windows' : /Macintosh|Mac OS X/i.test(ua) ? 'macOS'
            : /CrOS/i.test(ua) ? 'ChromeOS' : /Linux/i.test(ua) ? 'Linux' : 'Unknown';
    const device = /bot|crawler|spider/i.test(ua) ? 'Bot' : /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? 'Tablet'
        : /Mobile|iPhone|iPod/i.test(ua) ? 'Mobile' : os === 'Unknown' ? 'Unknown' : 'Desktop';
    // req.ip respects Express's configured proxy trust. Never read X-Forwarded-For directly.
    const address = String(req.ip || req.socket?.remoteAddress || '').replace(/^::ffff:/, '');
    let reportedTimezone = '';
    try {
        const timezone = req.body?.loginContext?.timezone;
        if (typeof timezone === 'string' && timezone.length <= 80) {
            new Intl.DateTimeFormat('en', { timeZone: timezone });
            reportedTimezone = timezone;
        }
    } catch { /* Invalid client-supplied timezone is ignored. */ }
    return { ip: isIP(address) ? address : '', browser, os, device, reportedTimezone };
}
module.exports = { allowedPortalOrigin, loginMetadata };

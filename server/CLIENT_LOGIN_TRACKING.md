# Client login tracking

Successful **Client** role logins are recorded only when the browser Origin matches an allowed portal. Paths such as `/dashboard` and `/dashboard/taskboard` belong to the same origin. Failed logins, other roles and existing session page loads do not create records.

The PM/admin top bar's **Client Logins** button shows a count for the last 24 hours. The paginated table shows client identity, projects, time, IP, approximate location, inferred device/browser and portal. It refreshes every 30 seconds and on window focus. No email messages or external tracking API calls are sent.

Assigned managers must be active users with the `Project Manager` role and be creator/team member of an active project linked to the client. Reads recheck current assignments. Admin/sub-admin can view all records; unassigned managers cannot. New managers do not receive past records retroactively. Events with no assigned manager remain visible to admin/sub-admin.

## Deployment configuration

Development defaults: `http://localhost:3001` and `https://taskmanagerclient.rowthtech.com`. Production (`NODE_ENV=production`) defaults to the production origin only.

Optional server environment settings:

```dotenv
# Exact comma-separated origins, without paths or trailing slashes.
CLIENT_LOGIN_PORTAL_ORIGINS=https://taskmanagerclient.rowthtech.com
CLIENT_LOGIN_RETENTION_DAYS=90
# Local city MMDB path inside the server/container; mount this file read-only.
CLIENT_LOGIN_GEOIP_DB=/app/geoip/GeoLite2-City.mmdb
# Set only to actual trusted proxy IPs/CIDRs for this deployment.
# TRUSTED_PROXY_CIDRS=127.0.0.1/32,::1/128
```

Install updated server dependencies. Supply a licensed City MMDB file (for example GeoLite2-City), maintain its updates separately, and restart after replacing it. Do not commit the database. The `maxmind` reader reads the local file without a location API call. Without a usable database or matching IP, the UI says **Location unavailable**. See [reader documentation](https://github.com/runk/node-maxmind#usage).

Behind a reverse proxy, configure the actual trusted IPs/CIDRs and ensure the ingress overwrites untrusted forwarding headers. Do not enable unrestricted proxy trust. Without proxy configuration, IP means the direct connection address. Browser Origin is a filter, not proof of a device's identity: non-browser clients can forge headers. Authentication, role and project checks enforce access.

Device/browser labels are User-Agent estimates. Reported timezone is labeled separately and is not physical location. No GPS is collected. IP location is approximate and may reflect a VPN/network exit. Local/private addresses have no public-city location.

Audit failures are logged and do not reject valid logins. Monitor `Client login audit failed`; audit delivery is best-effort during database failures. Retention is 1–365 days (default 90). Build MongoDB indexes through normal deployment migrations, especially the TTL index on `clientloginevents.expiresAt`. API queries hide expired records before TTL cleanup runs. Existing logins are not backfilled.

## Verification

Run `node --test tests/clientLoginTracking.test.js` from `server`.

For an end-to-end deployment check, log in as a Client from an allowed portal and open **Client Logins** as an assigned PM. Verify another PM and a Support account cannot read the event. Verify the real public IP behind the actual ingress before release.

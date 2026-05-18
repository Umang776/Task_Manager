# Operations runbook

Concise checklist for running Ethara Tasks in production.

## Backups (MongoDB)

- **Atlas:** enable [Cloud Backup](https://www.mongodb.com/docs/atlas/backup/cloud-backup/) on the cluster (M10+), or use **continuous backup / point-in-time** per your Atlas tier.
- **Self-hosted:** schedule `mongodump` (or Percona Backup) to object storage; test restores quarterly.
- Application code does **not** replace database backups.

## Staging

- Use a **separate** MongoDB database (or cluster) and deployment service for staging.
- Point staging `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` at staging URLs only; never reuse production secrets on staging if you mirror real data.

## Rate limits

- **`API_RATE_LIMIT_MAX`** (optional): max requests per IP per 15 minutes on all `/api/*` routes (default 600 in production). Increase if legitimate traffic hits 429.
- Auth routes also use a dedicated login/signup limiter (`server/middleware/rateLimit.js`).

## Observability

- **5xx errors:** logged with `console.error` in production (method, URL, stack).
- **4xx:** set `LOG_CLIENT_ERRORS=true` to log non-5xx handler errors as warnings (noisy; use sparingly).
- Add **Sentry** or OpenTelemetry later by wrapping `errorHandler` or using an Express monitoring package.

## Auth and domains

- **Admin** signup/login requires email on the workspace domain (default **`ethara.ai`** via `ALLOWED_EMAIL_DOMAIN`).
- **Member** accounts accept any valid email.
- JWT is stored in an **httpOnly** cookie (`ttm_at`). `Authorization: Bearer` is still accepted for scripts and API tools.
- **Split domains** (SPA on `app.example.com`, API on `api.example.com`): set `CROSS_ORIGIN_COOKIES=true` and HTTPS; cookie uses `SameSite=None; Secure`. You must set `CLIENT_URL` to the SPA origin(s) for CORS.

## Security perimeter (optional)

- Put the public URL behind a **CDN/WAF** (Cloudflare, AWS CloudFront + WAF, etc.) for DDoS and bot filtering.
- Enforce **HTTPS** only in production (cookies already use `Secure` when `NODE_ENV=production`).

## CI

- GitHub Actions runs **`npm test`** on server and client and builds the client. Extend with integration tests (Mongo required) when you add a test database service.

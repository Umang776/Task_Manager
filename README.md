# Ethara Tasks

Internal task management for Ethara — projects, assignments, and a drag-and-drop **Task Board**, with **Admin** and **Member** roles enforced on the server.

## Role-based access

| Role | Capabilities |
|------|----------------|
| **Admin** | Full CRUD on projects and tasks, manage project members, dashboard analytics, list users for assignment, delete projects/tasks. |
| **Member** | Projects they belong to; update **status** on **assigned** tasks; comments and Task Board on permitted tasks; no project/task delete or member management. |

Authorization uses **JWT in an httpOnly cookie** (and optional `Authorization: Bearer` for API clients), plus route-level role and assignment checks — not UI-only.

## Sign-in and registration

Choose **Admin** or **Member** on login and signup:

| Path | Email rule |
|------|------------|
| **Admin** | Must use an address ending with **`@ethara.ai`** (override domain with `ALLOWED_EMAIL_DOMAIN` on the server). |
| **Member** | Any valid email (e.g. Gmail, work). |

Signup sets the account role from this choice. Login verifies credentials and that the chosen path matches the stored role (admin vs member).

## Features

- Projects (Active, Completed, On Hold) with member lists
- Tasks — priorities, statuses, due dates, assignees, automatic overdue sync
- **Task Board** — column drag-and-drop ([@dnd-kit](https://dnd-kit.com)); `/kanban` redirects to `/board`
- Dashboard analytics (Recharts) and activity log
- Task list — search, filters, pagination
- Task comments (create, edit, delete with permissions)
- Custom UI controls (select, date picker, modals, confirm dialogs) and motion-enhanced interactions ([Framer Motion](https://www.framer.com/motion/))
- Dark mode (persisted)
- Responsive layout (Tailwind CSS v4)
- Docker Compose for local MongoDB
- Single-container production image (API + built SPA from Express)
- Automated tests and GitHub Actions CI

## Tech stack

| Area | Stack |
|------|--------|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router, Axios, React Hook Form, Recharts, Framer Motion, react-hot-toast, @dnd-kit |
| Backend | Node.js 18+, Express 5, Mongoose |
| Auth | JWT (httpOnly cookie + Bearer), bcrypt |
| Database | MongoDB |

## Repository layout

```
.
├── client/                 # React SPA
│   ├── src/
│   │   ├── api/
│   │   ├── components/     # layout, ui, TaskBoard, charts, …
│   │   ├── context/
│   │   └── pages/
│   └── vite.config.js
├── client/tests/           # Client smoke tests
├── docs/
│   └── OPERATIONS.md
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/              # allowedEmail, jwt, authCookie, …
│   ├── validations/
│   ├── seed/
│   ├── tests/
│   ├── app.js
│   └── server.js
├── Dockerfile
├── railway.json
├── render.yaml
├── docker-compose.yml
└── package.json            # Root: dev, build, test, seed
```

## Prerequisites

- Node.js 18+
- MongoDB (Docker Compose locally or MongoDB Atlas)

## Installation

```bash
npm run install:all
# or
cd server && npm install
cd ../client && npm install
```

## Environment variables

### Server (`server/.env`)

Copy `server/.env.example` to `server/.env`.

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5000`; use platform `PORT` in production) |
| `NODE_ENV` | `production` when deployed |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random secret for signing JWTs |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated. Optional on single-host Docker/Railway deploy (see below). |
| `ALLOWED_EMAIL_DOMAIN` | Optional; default `ethara.ai` for **admin** email validation |
| `API_RATE_LIMIT_MAX` | Optional; requests per IP per 15 min on `/api` |
| `CROSS_ORIGIN_COOKIES` | Set `true` when SPA and API are on different HTTPS domains |
| `SEED_ADMIN_EMAIL` / `SEED_MEMBER_EMAIL` | Optional overrides for `npm run seed` |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Full API base including `/api` when SPA and API are on **different** origins. Omit for local dev (Vite proxy) or combined deploy. |
| `VITE_PROXY_TARGET` | Optional; Vite dev proxy target (default `http://localhost:5000`) |

## Local development

1. Start MongoDB:

   ```bash
   docker compose up -d
   ```

2. Configure `server/.env` with `MONGO_URI` (e.g. `mongodb://127.0.0.1:27017/team-task-manager`).

3. Seed demo data:

   ```bash
   npm run seed
   ```

   Default accounts (override with `SEED_*` in `server/.env`):

   | Role | Email | Password |
   |------|--------|----------|
   | Admin | `admin@ethara.ai` | `Admin123!` |
   | Member | `demo.member@gmail.com` | `Member123!` |

4. Run API and client:

   ```bash
   npm run dev
   ```

   Or separately: `npm run dev --prefix server` and `npm run dev --prefix client`.

5. Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` to the API.

## Production build (local smoke test)

```bash
npm run install:all
npm run build
cd server
# PowerShell:
$env:NODE_ENV = "production"; node server.js
```

With `NODE_ENV=production` and `client/dist` present, the API serves the SPA on one port (default `5000`). The browser uses same-origin `/api`; `VITE_API_URL` is not required.

## Deployment (Docker)

The root **`Dockerfile`** builds the client and runs **`node server.js`** from `server/`. The process listens on **`PORT`** (default `5000`).

```bash
docker build -t ethara-tasks .
docker run --rm -p 5000:5000 ^
  -e NODE_ENV=production ^
  -e MONGO_URI="your-connection-string" ^
  -e JWT_SECRET="long-random-secret" ^
  -e CLIENT_URL="http://localhost:5000" ^
  ethara-tasks
```

On Linux/macOS, replace `^` with `\` for line continuation.

**Health check:** `GET /health` — JSON includes `ok` and `dbReady` when MongoDB is connected.

### Railway

- Connect the repo; Railway uses **`railway.json`** and the **Dockerfile**.
- Set `MONGO_URI`, `JWT_SECRET`, and **`CLIENT_URL`** to your public app URL (e.g. `https://your-app.up.railway.app`).
- Run **`npm run seed`** once against the same `MONGO_URI` if you want demo users (not automatic on deploy).

**Healthcheck / MongoDB:** If deploy fails, check logs for `MongoDB connection failed`. Fix `MONGO_URI`, Atlas **Network Access** (e.g. `0.0.0.0/0` or Railway egress), and database user credentials.

**Atlas `bad auth` (8000):** Reset the DB user password in Atlas → **Database Access**, then update `MONGO_URI`. You can build an encoded URI with:

```bash
npm run print:mongo-uri --prefix server
```

(Set `MONGO_PASS` in the shell; see `server/scripts/print-atlas-uri.mjs`.)

### Render

Optional **`render.yaml`** blueprint. Attach MongoDB or Atlas and set `MONGO_URI` and `CLIENT_URL`.

### Split hosting (SPA + API on different domains)

1. Build the client with `VITE_API_URL=https://api.example.com/api`.
2. Set server `CLIENT_URL` to the SPA origin(s). Use `CROSS_ORIGIN_COOKIES=true` over HTTPS.

## Testing

```bash
npm test
```

Server tests use `NODE_ENV=test` (rate limits disabled). HTTP validation tests do not require MongoDB. CI runs on push (`.github/workflows/ci.yml`).

## Operations

Backups, staging, rate limits, logging, and split-domain cookies: **[docs/OPERATIONS.md](docs/OPERATIONS.md)**.

## API reference

Base path: `/api`

### Auth

| Method | Path | Body (JSON) | Notes |
|--------|------|-------------|--------|
| POST | `/auth/signup` | `accountType` (`admin` \| `member`), `name`, `email`, `password` | Creates the account; **does not** set a session cookie. Sign in separately. Admin email must match workspace domain. |
| POST | `/auth/login` | `accountType`, `email`, `password` | Same cookie behavior; role must match `accountType`. |
| POST | `/auth/logout` | — | Clears session cookie. |
| GET | `/auth/me` | — | Current user (cookie or Bearer). |

### Users (admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users` | List users (assignments / members) |

### Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects` | List visible projects |
| POST | `/projects` | Create (admin) |
| GET | `/projects/:id` | Detail |
| PUT | `/projects/:id` | Update (admin) |
| DELETE | `/projects/:id` | Delete (admin) |

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks` | List — query: `project`, `status`, `search`, `page`, `limit` |
| GET | `/tasks/:id` | Detail |
| POST | `/tasks` | Create (admin) |
| PUT | `/tasks/:id` | Update (admin full; member status-only on assigned) |
| DELETE | `/tasks/:id` | Delete (admin) |
| GET | `/tasks/:taskId/comments` | List comments |
| POST | `/tasks/:taskId/comments` | Add comment |
| PATCH | `/tasks/:taskId/comments/:commentId` | Edit (author or admin) |
| DELETE | `/tasks/:taskId/comments/:commentId` | Delete (author or admin) |

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/stats` | Aggregated stats and recent activity |

## Security

- Passwords hashed with bcrypt (Mongoose `User` pre-save).
- Session cookie `ttm_at`: httpOnly, SameSite (and `Secure` in production).
- Helmet, CORS allowlist (or reflected origin when `CLIENT_URL` is unset in production combined deploy).
- Input validation (express-validator); centralized error handler.
- Global `/api` rate limiting and stricter auth route limits (`server/middleware/rateLimit.js`).

## License

MIT

# Team Task Manager

Production-ready monorepo for **role-based access (Admin / Member)**, projects, tasks, and progress tracking. **Admins** manage projects, members, and tasks. **Members** work on assigned tasks (status updates, comments, Kanban) without destructive permissions.

## Role-based access (Admin / Member)

| Role | Capabilities |
|------|----------------|
| **Admin** | Full CRUD on projects and tasks, manage project members, view all dashboard analytics, list users for assignment, delete tasks/projects. |
| **Member** | View projects they belong to; view and update **status** only on **assigned** tasks; comments and Kanban on permitted tasks; no project/task delete or member management. |

Enforcement is **server-side** (JWT + role middleware + per-route checks), not UI-only.

## Screenshots

> Placeholder: add screenshots of Dashboard, Projects, Tasks, and Kanban after deployment.

## Features

- **Role-based access (Admin / Member)** — JWT authentication with persistent sessions (local storage) and protected routes
- Projects with statuses: Active, Completed, On Hold
- Tasks with priorities (Low, Medium, High) and statuses (Todo, In Progress, Completed, Overdue)
- Automatic overdue sync based on due dates
- Dashboard analytics with Recharts
- Activity audit trail
- Task comments
- Task list search, filters, and pagination
- Drag-and-drop **Kanban** board (@dnd-kit)
- Dark mode (persisted)
- Responsive SaaS-style UI (Tailwind CSS)
- Docker Compose for local MongoDB
- Single-container production deploy (Dockerfile + static SPA from Express)
- Automated tests (`npm test`) and CI

## Tech Stack

| Area | Stack |
|------|--------|
| Frontend | React (Vite), Tailwind CSS v4, React Router, Axios, React Hook Form, Recharts, react-hot-toast, @dnd-kit |
| Backend | Node.js, Express 5, Mongoose |
| Auth | JWT, bcrypt password hashing |
| Database | MongoDB |

## Folder Structure

```
.
├── client/                 # React + Vite SPA
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── vite.config.js
├── client/tests/           # Node smoke tests (`npm test` in client/)
├── docs/
│   └── OPERATIONS.md
├── server/                 # Express API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validations/
│   ├── seed/
│   ├── tests/              # API smoke + unit tests (`npm test` in server/)
│   ├── app.js              # createApp() for server + automated tests
│   ├── server.js
│   └── .env.example
├── Dockerfile              # Production image: API + built SPA
├── railway.json            # Railway Docker build (repo root)
├── render.yaml             # Optional Render blueprint
├── docker-compose.yml
├── package.json            # Root scripts (dev, build, start)
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB (local via Docker Compose or hosted such as MongoDB Atlas)

## Installation

```bash
# From repository root (optional convenience)
npm run install:all

# Or install each workspace
cd server && npm install
cd ../client && npm install
```

## Environment Variables

### Server (`server/.env`)

Copy `server/.env.example` to `server/.env` and set:

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5000`; use host `PORT` in containers) |
| `NODE_ENV` | Set to `production` in deployed environments |
| `MONGO_URI` | Mongo connection string |
| `JWT_SECRET` | Strong secret for signing JWTs |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated. Use your public site URL(s). Optional in production combined deploy (see README). |

### Client (`client/.env`)

Copy `client/.env.example` to `client/.env` for production builds:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Full API base including `/api` when the SPA and API are on **different** origins. Omit for local dev (Vite proxy) or **combined** deploy (same origin `/api`). |

For **local development**, you can rely on the Vite dev proxy and omit `VITE_API_URL` so requests go to `/api` on the same origin.

## Local Development

1. Start MongoDB (example):

   ```bash
   docker compose up -d
   ```

2. Configure `server/.env` with `MONGO_URI` (e.g. `mongodb://127.0.0.1:27017/team-task-manager`).

3. Seed demo users and sample data:

   ```bash
   cd server
   npm run seed
   ```

   Default seed accounts (override with `SEED_*` env vars in `server/.env` if desired):

   - Admin: `admin@example.com` / `Admin123!`
   - Member: `member@example.com` / `Member123!`

4. Run API and web app:

   ```bash
   # from root
   npm run dev
   ```

   Or run separately:

   ```bash
   cd server && npm run dev
   cd client && npm run dev
   ```

5. Open `http://localhost:5173`.

The Vite dev server proxies `/api` to `http://localhost:5000` (override with `VITE_PROXY_TARGET` in `client/.env` if needed).

## Production build (local smoke test)

```bash
npm run install:all
npm run build
cd server
# PowerShell:
$env:NODE_ENV = "production"; node server.js
# cmd.exe:
#   set NODE_ENV=production && node server.js
```

With `NODE_ENV=production` and `client/dist` present, the API serves the React app on the same port (defaults to `5000`). Open `http://localhost:5000`. The SPA calls `/api` on the same origin, so you do **not** need `VITE_API_URL` for this layout.

## Deployment (Docker — recommended)

The repo root **`Dockerfile`** builds the Vite client, installs production server dependencies, and runs **`node server.js`** from `server/`. The container listens on **`PORT`** (default `5000`).

1. Add a **MongoDB** instance (Atlas, Railway Mongo plugin, Docker, etc.) and copy the connection string.
2. Build and run locally:

   ```bash
   docker build -t team-task-manager .
   docker run --rm -p 5000:5000 ^
     -e NODE_ENV=production ^
     -e MONGO_URI="your-connection-string" ^
     -e JWT_SECRET="long-random-secret" ^
     -e CLIENT_URL="http://localhost:5000" ^
     team-task-manager
   ```

   On Linux/macOS, use `-e VAR=value` without `^`.

3. **Production `CLIENT_URL`**: set to the **public URL users type in the browser** (comma-separated for multiple origins). If you omit it while `NODE_ENV=production`, CORS falls back to **reflecting the request `Origin`**, which works for a single public site but is less explicit than an allowlist.

**Health check:** `GET /health`

### Railway

- Connect the GitHub repo and create a **new service** from this repo (root directory `.`).
- Railway picks up **`railway.json`** and builds with the **Dockerfile**.
- Set variables: `MONGO_URI`, `JWT_SECRET`, and **`CLIENT_URL`** = your Railway app URL (e.g. `https://your-app.up.railway.app`). Railway injects `PORT`; do not hardcode it in the image.
- Optional: run **`npm run seed`** once from a local machine pointed at the same `MONGO_URI` to create demo users (not automatic in deploy).

**Healthcheck failed / “Network › Healthcheck”:** The app listens as soon as the container starts; `GET /health` should return **200** quickly. If deploy still fails, check **Deploy logs** for `MongoDB connection failed` — fix **`MONGO_URI`**, Atlas **Network Access** (allow `0.0.0.0/0` or Railway’s egress), and **database user** credentials. Open `/health` in the browser: `dbReady: true` means Mongo is connected.

**Atlas `bad auth` / error 8000:** The database username or password in `MONGO_URI` is wrong, or the password needs URL-encoding. In Atlas → **Database Access**, reset the user’s password, then either paste the URI from **Connect → Drivers** (replace `<password>`), or from repo root run `npm run print:mongo-uri --prefix server` after setting **`MONGO_PASS`** in your shell (see `server/scripts/print-atlas-uri.mjs`) and paste the printed line into Railway as **`MONGO_URI`**.

### Render

- Optional blueprint: **`render.yaml`** (Docker web service). Create a managed MongoDB or attach Atlas, then set `MONGO_URI` and `CLIENT_URL` on the web service to its public URL.

### Split hosting (API + static CDN)

If the frontend is hosted separately (e.g. Netlify, S3, Cloudflare Pages):

1. Build the client with **`VITE_API_URL`** set to your API’s public base **including `/api`**, e.g. `https://api.example.com/api`.
2. Set **`CLIENT_URL`** on the server to the SPA origin (or comma-separated list). Do **not** serve `client/dist` from the API container if you use this model; run the API with `NODE_ENV=production` but without copying `dist` into the image, or ignore the unused static files — the API still works; only unmatched non-API routes return JSON 404.

## Testing

```bash
npm test
# or
npm run test --prefix server
npm run test --prefix client
```

Server tests run with `NODE_ENV=test` (see `server/tests/test-env.cjs`); HTTP smoke tests do not require MongoDB. CI runs tests on every push (see `.github/workflows/ci.yml`).

## Operations

Backups, staging, rate limits, logging, and split-domain cookies: **[docs/OPERATIONS.md](docs/OPERATIONS.md)**.

## API Endpoints

Base path: `/api`

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Register (member role). Sets **httpOnly** session cookie; returns `user` only. |
| POST | `/auth/login` | Login. Sets **httpOnly** session cookie; returns `user` only. |
| POST | `/auth/logout` | Clears session cookie. |
| GET | `/auth/me` | Current user (session cookie or `Authorization: Bearer` for API clients) |

### Users (admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users` | List users (for assignments / members) |

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
| GET | `/tasks` | List with `project`, `status`, `search`, `page`, `limit` |
| GET | `/tasks/:id` | Task detail (access-checked) |
| POST | `/tasks` | Create (admin) |
| PUT | `/tasks/:id` | Update (admin full; member **status only** on assigned tasks) |
| DELETE | `/tasks/:id` | Delete (admin) |
| GET | `/tasks/:taskId/comments` | List comments |
| POST | `/tasks/:taskId/comments` | Add comment |
| PATCH | `/tasks/:taskId/comments/:commentId` | Edit comment (author or admin) |
| DELETE | `/tasks/:taskId/comments/:commentId` | Delete comment (author or admin) |

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/stats` | Aggregated stats + recent activity |

## Security Notes

- Passwords hashed with bcrypt (via Mongoose pre-save on `User`).
- JWT stored in an **httpOnly, SameSite** cookie (`ttm_at`) for browser sessions; `Authorization: Bearer` is still accepted for scripts and tooling.
- JWT required for all project/task/dashboard routes (via cookie or header).
- Role checks on destructive project/task operations and user listing.
- Helmet, CORS allowlist (or reflected origin when `CLIENT_URL` is unset in production), input validation (express-validator), centralized error handler.
- Global `/api` rate limiting plus stricter limits on login/signup (`server/middleware/rateLimit.js`).

## License

MIT

# Team Task Manager

Production-ready monorepo for role-based project and task management. **Admins** manage projects, members, and tasks. **Members** work on assigned tasks (status updates, comments, Kanban) without destructive permissions.

## Screenshots

> Placeholder: add screenshots of Dashboard, Projects, Tasks, and Kanban after deployment.

## Features

- JWT authentication with persistent sessions (local storage) and protected routes
- Roles: **admin** and **member** with server-side enforcement
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
- Railway-oriented server configuration

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
│   ├── server.js
│   └── railway.json
├── docker-compose.yml
├── package.json            # root scripts (optional)
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
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | Mongo connection string |
| `JWT_SECRET` | Strong secret for signing JWTs |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated if multiple |

### Client (`client/.env`)

Copy `client/.env.example` to `client/.env` for production builds:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Full API base including `/api`, e.g. `https://your-service.up.railway.app/api` |

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

## Production Build

```bash
cd client && npm run build
cd ../server && npm run start
```

Serve `client/dist` as static files from Express or a CDN if you prefer a split deployment.

## Railway Deployment

Typical setup uses **two Railway services**:

1. **MongoDB** plugin or external Atlas cluster — set `MONGO_URI` on the API service.
2. **API (Node)** — root directory `server`, build command `npm install`, start command `npm run start`. Set `PORT` (Railway provides), `JWT_SECRET`, `CLIENT_URL` (your deployed SPA origin), and `MONGO_URI`.

3. **Static SPA** — build `client` with `npm run build` and deploy `dist`, setting `VITE_API_URL` at build time to your public API base URL ending in `/api`.

`server/railway.json` documents a default start command for the API service.

## API Endpoints

Base path: `/api`

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Register (member role) |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Current user (Bearer token) |

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
| POST | `/tasks` | Create (admin) |
| PUT | `/tasks/:id` | Update (admin full; member **status only** on assigned tasks) |
| DELETE | `/tasks/:id` | Delete (admin) |
| GET | `/tasks/:taskId/comments` | List comments |
| POST | `/tasks/:taskId/comments` | Add comment |

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/stats` | Aggregated stats + recent activity |

## Security Notes

- Passwords hashed with bcrypt (via Mongoose pre-save on `User`).
- JWT required for all project/task/dashboard routes.
- Role checks on destructive project/task operations and user listing.
- Helmet, CORS allowlist, input validation (express-validator), centralized error handler.

## License

MIT

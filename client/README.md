# Ethara Tasks — client

React SPA built with Vite. See the [repository README](../README.md) for setup, environment variables, deployment, and API documentation.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR (proxies `/api` to the backend) |
| `npm run build` | Production build to `dist/` |
| `npm test` | Smoke tests (`client/tests/`) |

## Structure

- `src/pages/` — route screens (Dashboard, Projects, Tasks, Board, auth, …)
- `src/components/ui/` — shared inputs, selects, modals, buttons
- `src/components/TaskBoard.jsx` — Task Board (drag-and-drop columns)
- `src/api/client.js` — Axios instance (`withCredentials` for session cookies)

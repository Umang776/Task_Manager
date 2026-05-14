import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import userRoutes from './routes/user.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  app.set('trust proxy', 1);
}

function corsOriginConfig() {
  const raw = process.env.CLIENT_URL;
  if (raw) {
    return raw.split(',').map((s) => s.trim());
  }
  if (isProd) {
    return true;
  }
  return ['http://localhost:5173'];
}

app.use(
  cors({
    origin: corsOriginConfig(),
    credentials: true,
  })
);
app.use(
  helmet({
    contentSecurityPolicy: isProd ? false : undefined,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'team-task-manager-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

const clientDist = path.join(__dirname, '../client/dist');
const indexHtml = path.join(clientDist, 'index.html');
const canServeSpa = isProd && fs.existsSync(indexHtml);

if (canServeSpa) {
  app.use(
    express.static(clientDist, {
      index: false,
      maxAge: '1h',
    })
  );
}

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'Route not found' });
  }
  if (canServeSpa && (req.method === 'GET' || req.method === 'HEAD')) {
    res.setHeader('Cache-Control', 'no-cache');
    return res.sendFile(indexHtml, (err) => (err ? next(err) : undefined));
  }
  return res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start', err);
    process.exit(1);
  });

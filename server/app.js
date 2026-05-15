import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import userRoutes from './routes/user.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

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
  if (!isTest) {
    app.use(morgan(isProd ? 'combined' : 'dev'));
  }
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    const dbReady = mongoose.connection.readyState === 1;
    res.json({
      ok: true,
      service: 'team-task-manager-api',
      dbReady,
    });
  });

  app.use('/api', apiLimiter);

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

  return app;
}

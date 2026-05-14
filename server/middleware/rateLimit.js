import rateLimit from 'express-rate-limit';

const isProd = process.env.NODE_ENV === 'production';
const skipLimit = process.env.NODE_ENV === 'test';

const noop = (_req, _res, next) => next();

export const authLimiter = skipLimit
  ? noop
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: isProd ? 40 : 120,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many attempts. Please try again later.' },
    });

/** Broad limit on all /api routes (per IP). Tune with API_RATE_LIMIT_MAX. */
export const apiLimiter = skipLimit
  ? noop
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: Math.max(50, Number(process.env.API_RATE_LIMIT_MAX) || (isProd ? 600 : 5000)),
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests. Please try again later.' },
    });

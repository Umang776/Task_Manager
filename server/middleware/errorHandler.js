export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  const logLine = `[${statusCode}] ${req.method} ${req.originalUrl}`;
  if (process.env.NODE_ENV === 'production') {
    if (statusCode >= 500) {
      console.error(logLine, err);
    } else if (process.env.LOG_CLIENT_ERRORS === 'true') {
      console.warn(logLine, err.message);
    }
  } else {
    console.error(logLine, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
  });
}

import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const app = createApp();
const PORT = Number(process.env.PORT) || 5000;

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set. Add it in Railway → Variables (or your .env).');
  process.exit(1);
}

// Listen immediately so platform healthchecks (e.g. Railway GET /health) pass
// even while MongoDB is still connecting. Previously we waited for Mongo first,
// which caused healthcheck timeouts when the DB was slow or unreachable.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});

connectDB()
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection failed', err);
    process.exit(1);
  });

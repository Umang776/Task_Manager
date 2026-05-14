import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const app = createApp();
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

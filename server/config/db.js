import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI?.trim();
  if (!uri) {
    throw new Error('MONGO_URI is not defined');
  }
  const timeoutMs = Number(process.env.MONGO_SERVER_SELECTION_MS) || 45000;

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: timeoutMs,
    // Prefer IPv4 — avoids many Windows setups where IPv6 to Atlas fails and selection times out.
    family: 4,
  });
  console.log('MongoDB connected');
}

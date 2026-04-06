import mongoose from "mongoose";
import { logger } from "./logger";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/fmnexus";

  mongoose.connection.on("connected",    () => logger.info("MongoDB connected"));
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
  mongoose.connection.on("error",        (err) => logger.error("MongoDB error:", err));

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

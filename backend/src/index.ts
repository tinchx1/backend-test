import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { studentsRouter } from "./routes/students.js";

const PORT = Number(process.env.PORT) || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/backend-test";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

mongoose.connect(MONGODB_URI).then(
  () => console.log("MongoDB connected"),
  (err) => console.error("MongoDB connection failed:", err.message)
);

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "10kb" }));

app.use("/api/students", studentsRouter);

// Global error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
});

const server = app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  server.close(() => mongoose.connection.close());
});

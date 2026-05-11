import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js"

dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import assetRoutes from "./routes/assetRoutes.js"
import courseRoutes from "./routes/courseRoutes.js"
import studentRoutes from "./routes/studentRoutes.js"
import sessionRoutes from "./routes/sessionRoutes.js"

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/session", sessionRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend API running..." });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

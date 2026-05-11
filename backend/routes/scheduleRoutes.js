import express from "express";
import { generateSessionQR, createSchedule } from "../controllers/scheduleController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import Schedule from "../models/Schedule.js"

const router = express.Router();

router.get("/", protect, adminOnly, async (req, res) => {
  const schedules = await Schedule.find().populate("course");
  res.json(schedules);
});

router.post("/create", protect, adminOnly, createSchedule);
router.post("/generate-session-qr", protect, adminOnly, generateSessionQR);

export default router;
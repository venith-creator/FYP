import express from "express";
import { generateAttendanceQR, createSchedule } from "../controllers/scheduleController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, async (req, res) => {
  const schedules = await Schedule.find().populate("course");
  res.json(schedules);
});

router.post("/create", protect, adminOnly, createSchedule);
router.post("/generate-qr", protect, adminOnly, generateAttendanceQR);

export default router;
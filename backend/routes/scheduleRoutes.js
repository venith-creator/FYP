import express from "express";
import { generateAttendanceQR, createSchedule } from "../controllers/scheduleController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, adminOnly, createSchedule);
router.post("/generate-qr", protect, adminOnly, generateAttendanceQR);

export default router;
import express from "express";
import { getSessionAttendance, scanAttendance } from "../controllers/attendanceController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/scan", protect, scanAttendance);
router.get("/session/:sessionId", protect, adminOnly, getSessionAttendance);

export default router;
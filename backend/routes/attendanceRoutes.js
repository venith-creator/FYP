import express from "express";
import { getSessionAttendance, scanAttendance, getAllAttendance, attendanceAnalytics } from "../controllers/attendanceController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/scan", protect, scanAttendance);
router.get(
  "/all",
  protect,
  adminOnly,
  getAllAttendance
);
router.get(
  "/analytics",
  protect,
  adminOnly,
  attendanceAnalytics
);
router.get("/session/:sessionId", protect, adminOnly, getSessionAttendance);

export default router;
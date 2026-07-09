import express from "express";
import {
  getStudentAttendance,
  getBorrowedAssets, getMyCourses, getMySchedule, getAttendanceSummary, getCourseDashboard
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/attendance", protect, getStudentAttendance);
router.get("/assets", protect, getBorrowedAssets);
router.get("/courses", protect, getMyCourses);
router.get("/schedule", protect, getMySchedule);
router.get("/course-dashboard", protect, getCourseDashboard);
router.get("/attendance-summary", protect, getAttendanceSummary)
export default router;
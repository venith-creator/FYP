import express from "express";
import {
  getStudentAttendance,
  getBorrowedAssets, getMyCourses, getMySchedule
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/attendance", protect, getStudentAttendance);
router.get("/assets", protect, getBorrowedAssets);
router.get("/courses", protect, getMyCourses);
router.get("/schedule", protect, getMySchedule);
export default router;
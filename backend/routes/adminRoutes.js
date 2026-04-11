import express from "express";
import { getStudents, createStudent, dashboardStats, createMultipleStudents,  assignCoursesToStudent, getCourseAttendance, getAllAssetLogs, getStudentOverview} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, dashboardStats);

router.get("/students", protect, adminOnly, getStudents);

router.post("/create-student", protect, adminOnly, createStudent);

router.post("/create-many", protect, adminOnly, createMultipleStudents);

router.post("/assign-courses", protect, adminOnly, assignCoursesToStudent);

router.get("/course-attendance/:courseId", protect, adminOnly, getCourseAttendance);

router.get("/asset-logs", protect, adminOnly, getAllAssetLogs);

router.get(
  "/student-overview/:studentId",
  protect,
  adminOnly,
  getStudentOverview
);


export default router;
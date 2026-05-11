import express from "express";
import { createCourse, getCourses, getCourseStats } from "../controllers/courseController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, adminOnly, createCourse);

router.get("/", protect, getCourses);

router.get("/coursestat/:courseId", protect, adminOnly, getCourseStats)
export default router;
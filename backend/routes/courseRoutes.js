import express from "express";
import { createCourse, getCourses } from "../controllers/courseController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, adminOnly, createCourse);

router.get("/", protect, getCourses);

export default router;
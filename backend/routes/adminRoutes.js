import express from "express";
import { createStudent, dashboardStats } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, dashboardStats);

router.post("/create-student", protect, adminOnly, createStudent);

export default router;
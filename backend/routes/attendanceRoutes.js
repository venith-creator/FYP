import express from "express";
import { scanAttendance } from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/scan", protect, scanAttendance);

export default router;
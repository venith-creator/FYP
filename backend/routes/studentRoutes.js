import express from "express";
import {
  getStudentAttendance,
  getBorrowedAssets
} from "../controllers/studentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/attendance", protect, getStudentAttendance);

router.get("/assets", protect, getBorrowedAssets);

export default router;
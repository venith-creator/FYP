import express from "express";
import { createSession, addSessionNote, getSession, getSessionsBySchedule, createImpromptuSession, getImpromptuSessions } from "../controllers/sessionController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, adminOnly, createSession);
router.post(
  "/create-impromptu",
  protect,
  adminOnly,
  createImpromptuSession
);
router.get(
  "/impromptu",
  protect,
  adminOnly,
  getImpromptuSessions
);
router.post("/add-note", protect, adminOnly, addSessionNote);
router.get("/:id", protect, adminOnly, getSession);
router.get("/by-schedule/:scheduleId", protect, adminOnly, getSessionsBySchedule);

export default router;
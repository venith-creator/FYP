import express from "express";
import { adminSignup, loginUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/admin/signup", adminSignup);
router.post("/login", loginUser);

export default router;
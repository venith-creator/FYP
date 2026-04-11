import express from "express";
import {
  createAsset,
  borrowAsset,
  returnAsset,
  approveReturn
} from "../controllers/assetController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, adminOnly, createAsset);

router.post("/borrow", protect, borrowAsset);

router.post("/return", protect, returnAsset);

router.post("/approve-return", protect, adminOnly, approveReturn);

export default router;
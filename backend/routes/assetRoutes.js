import express from "express";
import {
  createAsset,
  borrowAsset,
  returnAsset,
  approveReturn,
  approveBorrow,
  rejectBorrow,
  rejectReturn,
  assetAnalytics,
  studentAssetLogs,
  getAssets
} from "../controllers/assetController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getAssets)

router.post("/create", protect, adminOnly, createAsset);

router.post("/borrow", protect, borrowAsset);

router.post("/return", protect, returnAsset);

router.get(
  "/student-logs",
  protect,
  studentAssetLogs
);

router.post("/approve-return", protect, adminOnly, approveReturn);

router.post(
  "/approve-borrow",
  protect,
  adminOnly,
  approveBorrow
);

router.post(
  "/reject-borrow",
  protect,
  adminOnly,
  rejectBorrow
);

router.post(
  "/reject-return",
  protect,
  adminOnly,
  rejectReturn
);

router.get(
  "/analytics",
  protect,
  adminOnly,
  assetAnalytics
);

export default router;
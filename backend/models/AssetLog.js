import mongoose from "mongoose";

const assetLogSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset"
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedReturn: {
      type: Boolean,
      default: false
    },

    borrowedAt: Date,

    returnedAt: Date,

    conditionOnReturn: String,
    dueDate: Date
  },
  { timestamps: true }
);

export default mongoose.model("AssetLog", assetLogSchema);
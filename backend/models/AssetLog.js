import mongoose from "mongoose";

const assetLogSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset"
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    borrowedAt: Date,

    returnedAt: Date,

    conditionOnReturn: String
  },
  { timestamps: true }
);

export default mongoose.model("AssetLog", assetLogSchema);
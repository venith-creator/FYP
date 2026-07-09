import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    name: String,

    assetTag: {
      type: String,
      unique: true
    },

    description: String,

    status: {
      type: String,
      enum: ["available", "pending-borrow", "borrowed", "maintenance", "pending-return"],
      default: "available"
    },

    qrCode: String
  },
  { timestamps: true }
);

export default mongoose.model("Asset", assetSchema);
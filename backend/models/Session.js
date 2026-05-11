import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule"
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },

    date: Date, // 🔥 specific class date

    startTime: String,
    endTime: String,

    location: {
      lat: Number,
      lng: Number,
      name: String
    },

    qrCode: String,
    qrExpiresAt: Date,

    sessionCode: String,
    sessionActive: Boolean,

    notes: [
      {
        text: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
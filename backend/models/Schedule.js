import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  dayOfWeek: String,

  startTime: String,
  endTime: String,

  qrCode: String,

  qrExpiresAt: Date
});

export default mongoose.model("Schedule", scheduleSchema);
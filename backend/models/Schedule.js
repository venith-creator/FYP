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

  qrExpiresAt: Date,

  sessionCode: String,  
  sessionActive: Boolean,
  sessionNote: String 
});

export default mongoose.model("Schedule", scheduleSchema);
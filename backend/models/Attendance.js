import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },

    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule"
    },

    status: {
      type: String,
      enum: ["present", "late"],
      default: "present"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
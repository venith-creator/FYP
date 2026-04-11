import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      sparse: true, // allows null for admins
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // allows null for students
    },
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
    },
    level: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
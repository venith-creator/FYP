import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateStudentId from "../utils/generateStudentId.js";
import Attendance from "../models/Attendance.js";
import AssetLog from "../models/AssetLog.js";

export const createStudent = async (req, res) => {

  const { name, department, level, password } = req.body;

  try {

    const studentId = await generateStudentId(department);

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await User.create({
      name,
      department,
      level,
      studentId,
      password: hashedPassword,
      role: "student"
    });

    res.json(student);

  } catch (error) {
    res.status(500).json(error.message);
  }

};

export const dashboardStats = async (req, res) => {

  try {

    const totalStudents = await User.countDocuments({ role: "student" });

    const totalAttendance = await Attendance.countDocuments();

    const borrowedAssets = await AssetLog.countDocuments({
      returnedAt: null
    });

    const returnedAssets = await AssetLog.countDocuments({
      returnedAt: { $ne: null }
    });

    res.json({
      totalStudents,
      totalAttendance,
      borrowedAssets,
      returnedAssets
    });

  } catch (error) {
    res.status(500).json(error.message);
  }

};
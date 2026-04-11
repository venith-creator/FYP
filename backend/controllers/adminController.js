import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateStudentId from "../utils/generateStudentId.js";
import Attendance from "../models/Attendance.js";
import AssetLog from "../models/AssetLog.js";
import Enrollment from "../models/Enrollment.js";
import generatePassword from "../utils/generatePassword.js";
import { Parser } from "json2csv";

export const createStudent = async (req, res) => {

  const { name, department, level } = req.body;

  try {

    const studentId = await generateStudentId(department);

    const firstName = name.split(" ")[0].toLowerCase();
    const plainPassword = `${firstName}${level}`;

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const student = await User.create({
      name,
      department,
      level,
      studentId,
      password: hashedPassword,
      role: "student"
    });

    res.json({ student,
      credentials: {
        studentId,
        password: plainPassword
      }
    });

  } catch (error) {
    res.status(500).json(error.message);
  }

};

export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .sort({ createdAt: -1 });

    res.json(students);
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

export const createMultipleStudents = async (req, res) => {

  const { students } = req.body;

  try {

    let results = [];

    for (let studentData of students) {

      const { name, department, level } = studentData;

      const studentId = await generateStudentId(department);

      const firstName = name.split(" ")[0].toLowerCase();
      const plainPassword = `${firstName}${level}`;

      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const student = await User.create({
        name,
        department,
        level,
        studentId,
        password: hashedPassword,
        role: "student"
      });

      results.push({
        name,
        studentId,
        password: plainPassword
      });
    }

    const parser = new Parser();
    const csv = parser.parse(results);

    res.header("Content-Type", "text/csv");
    res.attachment("students.csv");

    return res.send(csv);

  } catch (error) {
    res.status(500).json(error.message);
  }
};


export const assignCoursesToStudent = async (req, res) => {
  const { studentId, courseIds } = req.body;

  try {
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // clear old enrollments
    await Enrollment.deleteMany({ student: studentId });

    // create new
    const enrollments = courseIds.map(course => ({
      student: studentId,
      course
    }));

    await Enrollment.insertMany(enrollments);

    res.json({ message: "Courses assigned successfully" });

  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getCourseAttendance = async (req, res) => {
  const { courseId } = req.params;

  try {
    const records = await Attendance.find({ course: courseId })
      .populate("student", "name studentId")
      .populate("schedule");

    res.json(records);

  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getAllAssetLogs = async (req, res) => {
  try {
    const logs = await AssetLog.find()
      .populate("student", "name studentId")
      .populate("asset");

    res.json(logs);

  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getStudentOverview = async (req, res) => {
  const { studentId } = req.params;

  try {
    // 1. Attendance
    const attendance = await Attendance.find({ student: studentId })
      .populate("course", "courseCode courseTitle");

    // 2. Assets
    const assets = await AssetLog.find({ student: studentId })
      .populate("asset");

    // 3. Courses (from enrollment)
    const enrollments = await Enrollment.find({ student: studentId })
      .populate("course", "courseCode courseTitle");

    res.json({
      attendance,
      assets,
      courses: enrollments.map(e => e.course)
    });

  } catch (error) {
    res.status(500).json(error.message);
  }
};
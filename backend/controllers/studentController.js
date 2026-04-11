import Attendance from "../models/Attendance.js";
import AssetLog from "../models/AssetLog.js";
import Schedule from "../models/Schedule.js";
import Enrollment from "../models/Enrollment.js";

export const getStudentAttendance = async (req, res) => {
  try {

    const attendance = await Attendance.find({
      student: req.user._id
    }).populate("course schedule");

    res.json(attendance);

  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getBorrowedAssets = async (req, res) => {
  try {
    const assets = await AssetLog.find({
      student: req.user._id
    }).populate("asset");
    res.json(assets);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id
    }).populate("course");

    const courses = enrollments.map(e => e.course);

    res.json(courses);

  } catch (error) {
    res.status(500).json(error.message);
  }
};


export const getMySchedule = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id
    });

    const courseIds = enrollments.map(e => e.course);

    const schedules = await Schedule.find({
      course: { $in: courseIds }
    }).populate("course");

    res.json(schedules);

  } catch (error) {
    res.status(500).json(error.message);
  }
};
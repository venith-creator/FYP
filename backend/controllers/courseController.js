import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Attendance from "../models/Attendance.js";

export const createCourse = async (req, res) => {

  const { courseCode, courseTitle, department, level, lecturer } = req.body;

  try {

    const course = await Course.create({
      courseCode,
      courseTitle,
      department,
      level,
      lecturer
    });

    res.json(course);

  } catch (error) {
    res.status(500).json(error.message);
  }

};



export const getCourses = async (req, res) => {

  try {

    const courses = await Course.find().populate("lecturer", "name");

    res.json(courses);

  } catch (error) {
    res.status(500).json(error.message);
  }

};

export const getCourseStats = async (req, res) => {
  const { courseId } = req.params;

  try {
    const totalStudents = await Enrollment.countDocuments({
      course: courseId
    });

    const totalAttendance = await Attendance.countDocuments({
      course: courseId
    });

    res.json({
      totalStudents,
      totalAttendance,
      percentage:
        totalStudents > 0
          ? (totalAttendance / totalStudents) * 100
          : 0
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};
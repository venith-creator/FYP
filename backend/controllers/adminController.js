import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Session from "../models/Session.js";
import generateStudentId from "../utils/generateStudentId.js";
import Attendance from "../models/Attendance.js";
import AssetLog from "../models/AssetLog.js";
import Enrollment from "../models/Enrollment.js";
import generatePassword from "../utils/generatePassword.js";
import { sendEmail } from "../utils/email.js";
import { studentWelcomeTemplate } from "../utils/emailTemplates.js";
import { Parser } from "json2csv";

export const createStudent = async (req, res) => {

  const { name, department, level, email } = req.body;

  try {

    const studentId = await generateStudentId(department);

    const firstName = name.split(" ")[0].toLowerCase();
    const plainPassword = `${firstName}${level}`;

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const student = await User.create({
      name,
      department,
      level,
      email,
      studentId,
      password: hashedPassword,
      role: "student"
    });

    if (email) {

        await sendEmail({

            to: email,

            subject: "Your Student Account",

            html: studentWelcomeTemplate({

                name,

                studentId,

                password: plainPassword

            })

        });

    }

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

export const updateStudent = async (req, res) => {
  try {

    const student = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        department: req.body.department,
        level: req.body.level
      },
      { returnDocument: "after",
        runValidators: true
       }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

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

export const createMultipleStudents = async (req, res) => {

  const { students } = req.body;

  try {

    let results = [];

    for (let studentData of students) {

      const { name, department, level, email } = studentData;

      const studentId = await generateStudentId(department);

      const firstName = name.split(" ")[0].toLowerCase();
      const plainPassword = `${firstName}${level}`;

      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const student = await User.create({
        name,
        department,
        level,
        studentId,
        email,
        password: hashedPassword,
        role: "student"
      });

      if (email) {

          await sendEmail({
              to: email,
              subject: "Your Student Account",
              html: studentWelcomeTemplate({
                  name,
                  studentId,
                  password: plainPassword
              })
          });
      }
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

    // Enrollments + courses
    const enrollments = await Enrollment.find({
      student: studentId
    }).populate("course");

    // Attendance records
    const attendance = await Attendance.find({
      student: studentId
    })
      .populate("course", "courseCode courseTitle")
      .populate({
        path: "session",
        populate: [
          {
            path: "course",
            select: "courseCode courseTitle"
          },
          {
            path: "schedule"
          }
        ]
      })
      .sort({ createdAt: -1 });

    // Assets
    const assets = await AssetLog.find({
      student: studentId
    }).populate("asset");

    // Upcoming classes
    const upcoming = await Session.find({
      course: {
        $in: enrollments.map(e => e.course._id)
      },
      date: {
        $gte: new Date()
      }
    }).populate("course");

    // Attendance summary per course
    const summary = [];

    for (const enrollment of enrollments) {

      const totalSessions =
        await Session.countDocuments({
          course: enrollment.course._id
        });

      const attended =
        await Attendance.countDocuments({
          student: studentId,
          course: enrollment.course._id
        });

      summary.push({
        course: enrollment.course,
        attended,
        totalSessions,
        percentage:
          totalSessions === 0
            ? 0
            : Math.round(
                (attended / totalSessions) * 100
              )
      });
    }

    // Analytics
    const analytics = {
      totalAttendance: attendance.length,

      upcomingClasses: upcoming.length,

      totalCourses: summary.length,

      overallPercentage:
        summary.length === 0
          ? 0
          : Math.round(
              summary.reduce(
                (sum, item) => sum + item.percentage,
                0
              ) / summary.length
            )
    };

    res.json({
      courses: enrollments.map(e => e.course),

      attendance,

      assets,

      upcoming,

      summary,

      analytics
    });

  } catch (error) {
    res.status(500).json(error.message);
  }
};
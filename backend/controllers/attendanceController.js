import Attendance from "../models/Attendance.js";
import Enrollment from "../models/Enrollment.js";
import Session from "../models/Session.js";

const getDistance = (loc1, loc2) => {
  const toRad = (val) => (val * Math.PI) / 180;

  const R = 6371e3; // meters
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.lat)) *
      Math.cos(toRad(loc2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const scanAttendance = async (req, res) => {
  const { sessionId, code, userLocation } = req.body;

  try {

    let session;

    if (sessionId) {
      session =
        await Session.findById(sessionId)
          .populate("course");
    } else {
      session =
        await Session.findOne({
          sessionCode: code,
          qrExpiresAt: { $gte: new Date() }
        }).populate("course");
    }

    if (!session) {
      return res.status(404).json({
        message:
          "No active session found for this code"
      });
    }
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // 🔐 code validation
    if (session.sessionCode != code) {
      return res.status(400).json({ message: "Invalid session code" });
    }

    // ⏱ time validation
    if (new Date() > session.qrExpiresAt) {
      return res.status(400).json({ message: "Session expired" });
    }

    // 📍 location validation
    console.log("userLocation", userLocation);
    console.log("session.location", session.location);
    const distance = getDistance(userLocation, session.location);

    console.log("distance =", distance);

    if (distance > 500) {
      return res.status(403).json({
        message: "You are not within class location"
      });
    }

    // 🎓 enrollment check
    const isEnrolled = await Enrollment.findOne({
      student: req.user._id,
      course: session.course
    });

    if (!isEnrolled) {
      return res.status(403).json({
        message: "You are not enrolled in this course"
      });
    }

    // 🚫 prevent duplicate
    const existing = await Attendance.findOne({
      student: req.user._id,
      session: session._id
    });

    if (existing) {
      return res.status(400).json({
        message: "Attendance already recorded"
      });
    }
    console.log("sessionId from body:", sessionId);

    console.log("session found:", session._id);

    const attendance = await Attendance.create({
      student: req.user._id,
      course: session.course,
      schedule: session.schedule,
      session: session._id
    });

    res.json({
      message: "Attendance recorded",
      attendance
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// get attendance for a schedule
export const getSessionAttendance = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const records = await Attendance.find({ session: sessionId })
      .populate("student", "name studentId");

    res.json(records);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("student", "name studentId")
      .populate("course", "courseCode")
      .populate("session");

    res.json(records);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const attendanceAnalytics = async (req, res) => {
  try {

    const totalAttendance =
      await Attendance.countDocuments();

    const today = new Date();

    today.setHours(0,0,0,0);

    const attendanceToday =
      await Attendance.countDocuments({
        createdAt: { $gte: today }
      });

    res.json({
      totalAttendance,
      attendanceToday
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};
import Attendance from "../models/Attendance.js";
import Schedule from "../models/Schedule.js";

export const scanAttendance = async (req, res) => {

  const { scheduleId } = req.body;

  try {

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // check QR expiry
    if (new Date() > schedule.qrExpiresAt) {
      return res.status(400).json({ message: "QR code expired" });
    }

    // prevent double attendance
    const existing = await Attendance.findOne({
      student: req.user._id,
      schedule: scheduleId
    });

    if (existing) {
      return res.status(400).json({ message: "Attendance already recorded" });
    }

    const attendance = await Attendance.create({
      student: req.user._id,
      course: schedule.course,
      schedule: scheduleId
    });

    res.json({
      message: "Attendance recorded",
      attendance
    });

  } catch (error) {
    res.status(500).json(error.message);
  }

};
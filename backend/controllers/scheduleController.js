import Schedule from "../models/Schedule.js";
import generateQR from "../utils/generateQR.js";

export const generateAttendanceQR = async (req, res) => {

  const { scheduleId } = req.body;

  try {

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // QR valid for 15 mins

    const qrData = JSON.stringify({
      scheduleId: schedule._id
    });

    const qrCode = await generateQR(qrData);

    schedule.qrCode = qrCode;
    schedule.qrExpiresAt = expires;

    await schedule.save();

    res.json({
      qrCode,
      expires
    });

  } catch (error) {
    res.status(500).json(error.message);
  }

};

export const createSchedule = async (req, res) => {

  const { course, dayOfWeek, startTime, endTime } = req.body;

  try {

    const schedule = await Schedule.create({
      course,
      dayOfWeek,
      startTime,
      endTime
    });

    res.json(schedule);

  } catch (error) {
    res.status(500).json(error.message);
  }

};
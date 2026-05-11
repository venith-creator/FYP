import Schedule from "../models/Schedule.js";
import generateQR from "../utils/generateQR.js";
import Session from "../models/Session.js";

/*export const generateAttendanceQR = async (req, res) => {

  const { scheduleId, note } = req.body;

  try {

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // QR valid for 15 mins

    const sessionCode = Math.floor(100000 + Math.random() * 900000);

    const qrData = JSON.stringify({
      scheduleId: schedule._id,
      code: sessionCode
    });

    const qrCode = await generateQR(qrData);

    schedule.qrCode = qrCode;
    schedule.qrExpiresAt = expires;
    schedule.sessionCode = sessionCode;
    schedule.sessionActive = true;
    schedule.sessionNote = note || "";

    await schedule.save();

    res.json({
      qrCode,
      expires,
      sessionCode
    });

  } catch (error) {
    res.status(500).json(error.message);
  }

};*/

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

export const generateSessionQR = async (req, res) => {
  const { sessionId, note } = req.body;

  const session = await Session.findById(sessionId);

  const sessionStart = new Date(session.date);
  const [hours, minutes] = session.startTime.split(":");

    sessionStart.setHours(hours);
    sessionStart.setMinutes(minutes);

    // QR expires 30 mins after start
    const expires = new Date(sessionStart);
    expires.setMinutes(expires.getMinutes() + 30);

    const now = new Date();
    const diff = sessionStart - now;

    // allow QR generation 30 mins before class
    if (diff > 30 * 60 * 1000) {
      return res.status(400).json({
        message: "QR can only be generated 30 mins before class"
      });
    }

  const sessionCode = Math.floor(100000 + Math.random() * 900000);

  const qrData = JSON.stringify({
    sessionId,
    code: sessionCode
  });

  const qrCode = await generateQR(qrData);

  session.qrCode = qrCode;
  session.qrExpiresAt = expires;
  session.sessionCode = sessionCode;
  session.sessionActive = true;

  if (note) {
    session.notes.push({ text: note });
  }

  await session.save();

  res.json({
    qrCode,
    sessionCode,
    expires
  });
};
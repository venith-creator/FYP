import Schedule from "../models/Schedule.js";
import generateQR from "../utils/generateQR.js";
import Session from "../models/Session.js";


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

      const openTime = new Date(sessionStart);
      openTime.setMinutes(openTime.getMinutes() - 30);

      const closeTime = new Date(sessionStart);
      closeTime.setMinutes(closeTime.getMinutes() + 30);

      if (now < openTime) {
        return res.status(400).json({
          message: "QR can only be generated 30 minutes before class."
        });
      }

      if (now > closeTime) {
        return res.status(400).json({
          message: "QR generation period has ended."
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
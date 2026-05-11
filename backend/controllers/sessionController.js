import Session from "../models/Session.js";
import Schedule from "../models/Schedule.js";

export const createSession = async (req, res) => {
  const { scheduleId, date, startTime, endTime, location } = req.body;

  try {
    const schedule = await Schedule.findById(scheduleId);

    const { weeks = 1 } = req.body;

        let sessions = [];

        for (let i = 0; i < weeks; i++) {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + i * 7);

        const session = await Session.create({
            schedule: scheduleId,
            course: schedule.course,
            date: newDate,
            startTime,
            endTime,
            location
        });

        sessions.push(session);
        }

        res.json(sessions);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const addSessionNote = async (req, res) => {
  const { sessionId, text } = req.body;

  try {
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.notes.push({ text });

    await session.save();

    res.json(session);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("course")
      .populate("schedule");

    res.json(session);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const getSessionsBySchedule = async (req, res) => {
    try {
  const sessions = await Session.find({
    schedule: req.params.scheduleId
  })
  .populate("course")
  .populate("schedule")
  .sort({ date: -1 });

  res.json(sessions);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// CREATE IMPROMPTU SESSION
export const createImpromptuSession = async (req, res) => {
  try {
    const {
      course,
      date,
      startTime,
      endTime,
      location
    } = req.body;

    const session = await Session.create({
      schedule: null,
      course,
      date,
      startTime,
      endTime,
      location
    });

    res.json(session);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
// GET IMPROMPTU SESSIONS
export const getImpromptuSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      schedule: null
    })
      .populate("course")
      .sort({ date: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
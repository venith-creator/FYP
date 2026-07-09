import Session from "../models/Session.js";
import Schedule from "../models/Schedule.js";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import { sendEmail } from "../utils/email.js";
import { sessionCreatedTemplate } from "../utils/emailTemplates.js";

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

    const enrolledStudents = await Enrollment.find({
        course: schedule.course
      }).populate("student");

      const course = await Course.findById(schedule.course);

      for (const enrollment of enrolledStudents) {

        const student = enrollment.student;

        if (!student?.email) continue;

        await sendEmail({
          to: student.email,
          subject: "New Class Session",
          html: sessionCreatedTemplate({
            name: student.name,
            course: course.courseCode,
            date: new Date(date).toDateString(),
            startTime,
            endTime,
            location
          })
        });

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

    const enrolledStudents = await Enrollment.find({
        course
      }).populate("student");

      const courseInfo = await Course.findById(course);

      for (const enrollment of enrolledStudents) {

        const student = enrollment.student;

        if (!student?.email) continue;

        await sendEmail({
          to: student.email,
          subject: "New Impromptu Class",
          html: sessionCreatedTemplate({
            name: student.name,
            course: courseInfo.courseCode,
            date: new Date(date).toDateString(),
            startTime,
            endTime,
            location
          })
        });

      }

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

// GET ALL SESSIONS
export const getAllSessions = async (req, res) => {
  try {

    const sessions = await Session.find()
      .populate("course")
      .populate("schedule")
      .sort({ date: -1 });

    res.json(sessions);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const getUpcomingSessions = async (req, res) => {

  try {

    const enrollments = await Enrollment.find({
      student: req.user._id
    });

    const courseIds = enrollments.map(
      e => e.course
    );

    const sessions = await Session.find({
      course: { $in: courseIds },
      date: { $gte: new Date() }
    })
      .populate("course")
      .sort({ date: 1 });

    res.json(sessions);

  } catch (err) {
    res.status(500).json(err.message);
  }

};

export const getStudentSessions = async (req, res) => {

  try {

    const enrollments = await Enrollment.find({
      student: req.user._id
    });

    const courseIds = enrollments.map(
      e => e.course
    );

    const sessions = await Session.find({
      course: {
        $in: courseIds
      }
    })
      .populate("course")
      .sort({ date: 1 });

    const now = new Date();

    const result = sessions.filter(session => {

      const start = new Date(session.date);

      const [h, m] = session.startTime.split(":");

      start.setHours(h, m);

      const end = new Date(session.date);

      const [eh, em] = session.endTime.split(":");

      end.setHours(eh, em);

      return end >= now;
    });

    res.json(result);

  } catch (err) {
    res.status(500).json(err.message);
  }
};
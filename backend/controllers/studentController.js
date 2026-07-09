import Attendance from "../models/Attendance.js";
import AssetLog from "../models/AssetLog.js";
import Schedule from "../models/Schedule.js";
import Enrollment from "../models/Enrollment.js";
import Session from "../models/Session.js";

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

export const getAttendanceSummary = async (req,res)=>{

    try{

        const enrollments =
        await Enrollment.find({
            student:req.user._id
        }).populate("course");

        const attendance = await Attendance.find({
              student: req.user._id
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

        const upcoming =
        await Session.find({
            course:{
                $in:enrollments.map(e=>e.course._id)
            },
            date:{
                $gte:new Date()
            }
        }).populate("course");

        const summary=[];

        for(const enrollment of enrollments){

            const totalSessions=
            await Session.countDocuments({
                course:enrollment.course._id
            });

            const attended=
            await Attendance.countDocuments({
                student:req.user._id,
                course:enrollment.course._id
            });

            summary.push({

                course:enrollment.course,

                attended,

                totalSessions,

                percentage:
                totalSessions===0
                ?0
                :Math.round(
                    attended/totalSessions*100
                )

            });

        }

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

            attendance,

            upcoming,

            summary,

            analytics

        });

    }

    catch(err){

        res.status(500).json(err.message);

    }

}

export const getCourseDashboard = async (req, res) => {
  try {

    // enrolled courses
    const enrollments = await Enrollment.find({
      student: req.user._id
    }).populate({
      path: "course",
      populate: {
        path: "lecturer",
        select: "name"
      }
    });

    const courseIds = enrollments.map(e => e.course._id);

    // timetable
    const schedules = await Schedule.find({
      course: { $in: courseIds }
    })
      .populate({
        path: "course",
        populate: {
          path: "lecturer",
          select: "name"
        }
      })
      .sort({
        day: 1,
        startTime: 1
      });

    // upcoming sessions
    const upcoming = await Session.find({
      course: { $in: courseIds },
      date: { $gte: new Date() }
    })
      .populate("course")
      .sort({
        date: 1
      });

    const today = new Date();

    const weekEnd = new Date();

    weekEnd.setDate(today.getDate() + 7);

    const classesThisWeek = upcoming.filter(
      s =>
        new Date(s.date) <= weekEnd
    ).length;

    const upcomingToday = upcoming.filter(s => {

      const d = new Date(s.date);

      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );

    }).length;

    const summary = [];

    for (const enrollment of enrollments) {

      const totalSessions =
        await Session.countDocuments({
          course: enrollment.course._id
        });

      const attended =
        await Attendance.countDocuments({
          student: req.user._id,
          course: enrollment.course._id
        });

      const percentage =
        totalSessions === 0
          ? 0
          : Math.round(
              (attended / totalSessions) * 100
            );

      const nextClass = upcoming.find(
        u =>
          String(u.course._id) ===
          String(enrollment.course._id)
      );

      summary.push({

        course: enrollment.course,

        attended,

        totalSessions,

        missed:
          totalSessions - attended,

        percentage,

        nextClass

      });

    }

    const overallAttendance =
      summary.length === 0
        ? 0
        : Math.round(
            summary.reduce(
              (sum, item) =>
                sum + item.percentage,
              0
            ) / summary.length
          );

    res.json({

      courses: enrollments.map(
        e => e.course
      ),

      schedules,

      summary,

      stats: {

        totalCourses:
          enrollments.length,

        classesThisWeek,

        upcomingToday,

        overallAttendance

      }

    });

  }

  catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
};
import Course from "../models/Course.js";

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
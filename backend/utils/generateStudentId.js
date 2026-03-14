import User from "../models/User.js";

const generateStudentId = async (department) => {
  const count = await User.countDocuments({ role: "student" });

  const year = new Date().getFullYear().toString().slice(-2);

  const number = (count + 1).toString().padStart(3, "0");

  const prefix = department.slice(0, 3).toUpperCase();

  return `${prefix}-${year}-${number}`;
};

export default generateStudentId;
import Attendance from "../models/Attendance.js";
import AssetLog from "../models/AssetLog.js";

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
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import generateStudentId from "../utils/generateStudentId.js";


// ADMIN SIGNUP (hidden route)

export const adminSignup = async (req, res) => {

  const { name, password, email, secret } = req.body;

  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: "Invalid secret code" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    res.json({
      token: generateToken(admin._id, admin.role)
    });

  } catch (error) {
    res.status(500).json(error.message);
  }

};

// LOGIN (students + admins)

export const loginUser = async (req, res) => {
  const { studentId, email, password } = req.body;

  try {
    let user;

    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ studentId });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({
      token: generateToken(user._id, user.role),
      user,
    });

  } catch (error) {
    res.status(500).json(error.message);
  }
};
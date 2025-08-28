import { createToken, PASSWORD_MIN_LENGTH } from "../utils/auth.utils.js";
import { compare, genSalt, hash } from "bcrypt";

import { User } from "../models/users.models.js"
import { Settings } from "../models/settings.models.js"

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await  User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = createToken({ id: user._id });

    res.status(201).json({ message: "Logged In", content: { ...user.toJSON(), token } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export const register = async (req, res) => {
  // TODO: Email Verification with Nodemailer
  const { name, email, password } = req.body;

  try {
    const userCount = await User.countDocuments();

      if (userCount > 0) {
        const settings = await Settings.findOne();
        if (!settings?.allowUserRegistration) {
          return res.status(403).json({ message: "User registration is currently disabled." });
        }
      }

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`});
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: userCount === 0
    });

    const token = createToken({ id: user._id });

    if (user.isAdmin && !Settings.findOne()) {
      await Settings.create({ allowUserRegistration: false });
    }

    res.status(201).json({ message: "User created", content: {...user.toJSON(), token} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error or invalid data" });
  }
}

export const getUser = async (req, res) => {
  const user = req.user;
  res.status(200).json({message:"User is authenticated", content: user});
}

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password." });
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: `New password must be at least ${PASSWORD_MIN_LENGTH} characters length.` })
    }

    const salt = await genSalt(10);
    user.password = await hash(newPassword, salt);

    await user.save();

    res.status(204).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

import { genSalt, hash } from "bcrypt";

import { User } from "../models/users.models.js";
import { PASSWORD_MIN_LENGTH } from "../utils/auth.utils.js";

export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {

    if (!name || !email || !password) {
      return res.status(400).json({ message: req.__( "controller.user.requiredFields" ) });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: `${req.__("controller.auth.passwordLengthError")}: ${PASSWORD_MIN_LENGTH}` });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: req.__("controller.auth.emailInUse") });

    const salt = await genSalt(10);
    req.body.password = await hash(password, salt);

    const user = await User.create({
      ...req.body,
      isAdmin: false
    });

    res.status(201).json({ message: req.__("controller.user.createdSuccess"), content: {user}});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

export const hasUsers = async (_req, res) => {
  const userCount = await User.countDocuments();
  res.status(200).json({ content: userCount > 0 });
}

import { compare, genSalt, hash } from "bcrypt";

import { User } from "../models/users.models.js"
import { Settings } from "../models/settings.models.js"
import { createToken, PASSWORD_MIN_LENGTH, verifyToken } from "../utils/auth.utils.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await  User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: req.__("controller.auth.invalidCredentials") });

    const match = await compare(password, user.password);
    if (!match) return res.status(400).json({ message: req.__("controller.auth.invalidCredentials") });

    const token = createToken({ id: user._id }, { expiresIn: "15m" });

    const refresh = createToken({ id: user._id });

    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ message: req.__("controller.auth.loginSuccess") , content: { token } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
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
          return res.status(403).json({ message: req.__("controller.auth.registrationDisabled") });
        }
      }

    if (!name || !email || !password) {
      return res.status(400).json({ message: req.__("controller.auth.missingCredentials") });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: `${req.__("controller.auth.passwordMinLength")}: ${PASSWORD_MIN_LENGTH}`});
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: req.__("controller.auth.emailInUse") });

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: userCount === 0
    });

    const token = createToken({ id: user._id }, { expiresIn: "15m" });

    const refresh = createToken({ id: user._id });

    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    if (user.isAdmin && !Settings.findOne()) {
      await Settings.create({ allowUserRegistration: false });
    }

    res.status(201).json({ message: req.__("controller.auth.registeredSuccess"), content: { token } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

export const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) return res.status(401).json({ message: req.__("controller.auth.noTokenProvided") });

  try {
    const payload = verifyToken(token);

    const newAccessToken = createToken( { id: payload.id }, { expiresIn: "15m" } );

    res.json({ content: { token: newAccessToken } });
  } catch (err) {
    return res.status(403).json({ message: req.__("controller.auth.sessionExpired") });
  }
}

export const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    path: "/api/auth/refresh",
    sameSite: "strict",
    secure: true,
    httpOnly: true,
  });

  res.json({ message: req.__("controller.auth.logoutSuccess") });
}

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: req.__("controller.auth.missingChangePassword") });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: req.__("controller.auth.userNotFound") });
    }

    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: req.__("controller.auth.incorrectPassword") });
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: `${req.__("controller.auth.passwordMinLength")}: ${PASSWORD_MIN_LENGTH}` })
    }

    const salt = await genSalt(10);
    user.password = await hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: req.__("controller.auth.passwordChanged") });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

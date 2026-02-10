import { genSalt, hash } from "bcrypt";

import { User } from "../models/users.models.js";
import { PASSWORD_MIN_LENGTH } from "../utils/auth.utils.js";
import { Account } from "../models/accounts.models.js";
import { Transaction } from "../models/transactions.models.js";

export const getUserByToken = async (req, res) => {
  const user = req.user;
  res.status(200).json({ message: req.__("controller.auth.authenticated"), content: user });
}

export const getAllUsers = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sort = 'desc',
    searchTerm,
  } = req.query;

  try {
    if (isNaN(page) || isNaN(limit) || page < 1) {
      return res
        .status(400)
        .json({ message: req.__("common.paginationPositiveInteger") });
    }

    const filters = {};

    if (searchTerm) {
      filters.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } }
      ];
    }

    let query = User.find(filters).select("-password").sort({ [sortBy]: sort === 'desc' ? -1 : 1 });

    if (limit > 0) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const [users, total] = await Promise.all([
      query.exec(),
      User.countDocuments(filters),
    ]);

    return res.status(200).json({
      page: limit > 0 ? Number(page) : 1,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
      content: users,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }

  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.status(200).json({ content: users });
}

export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: req.__("controller.user.notFound") });
    res.status(200).json({ content: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

export const updateUserByToken = async (req, res) => {
  const user = req.user;
  const { name, email } = req.body;

  try {
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: req.__("controller.auth.emailInUse") });
      user.email = email;
      // TODO: Email verification process??
    }

    if (name) user.name = name;

    await user.save();
    res.status(200).json({ message: req.__("controller.user.updateSuccess"), content: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

export const createUser = async (req, res) => {
  const { name, email, password, isAdmin } = req.body;

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
      isAdmin: isAdmin || false,
    });

    res.status(201).json({ message: req.__("controller.user.createdSuccess"), content: {user}});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, isAdmin } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: req.__("controller.user.notFound") });
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: req.__("controller.auth.emailInUse") });
      //TODO: Email verification process??
      user.email = email;
    }
    if (name) user.name = name;
    if (typeof isAdmin === "boolean") user.isAdmin = isAdmin;
    await user.save();
    res.status(200).json({ message: req.__("controller.user.updateSuccess"), content: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: req.__("controller.user.notFound") });
    Account.find({ owner: user._id }).then(accounts => {
      accounts.forEach(async account => {
        await Transaction.deleteMany({ account: account._id }).catch(err => console.error(err));
        await Account.deleteOne({ _id: account._id }).catch(err => console.error(err));
      });
    }).catch(err => console.error(err));
    await User.deleteOne({ _id: id });
    res.status(200).json({ message: req.__("controller.user.deleteSuccess") });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

export const hasUsers = async (_req, res) => {
  const userCount = await User.countDocuments();
  res.status(200).json({ content: userCount > 0 });
}

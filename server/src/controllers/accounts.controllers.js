import { Account } from "../models/accounts.models.js";
import { Transaction } from "../models/transactions.models.js";

export const getAccountsByToken = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  try {
    if (isNaN(page) || isNaN(limit) || page < 1) {
      return res.status(400).json({ message: req.__("common.paginationPositiveInteger") });
    }

    let query = Account.find({ owner: userId }).select("-description");

    if (limit > 0) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const [accounts, total] = await Promise.all([
      query.exec(),
      Account.countDocuments()
    ]);

    res.status(200).json({
      page: limit > 0 ? page : 1,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
      content: accounts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

export const getAccountById = async (req, res) => {
  const accountId = req.params.id;
  const userId = req.user.id;

  try {
    const account = await Account.findOne({ _id: accountId, owner: userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    res.status(200).json({ content: account });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

export const createAccount = async (req, res) => {
  const { name, balance, description } = req.body;
  const userId = req.user.id;

  try {
    if (!name || balance === undefined || isNaN(balance)) {
      return res.status(400).json({ message: req.__("controller.account.requiredFields") });
    }

    if (isNaN(balance)) {
      return res.status(400).json({ message: req.__("controller.account.balanceNumber") });
    }

    if (description && description.length > 128) {
      return res.status(400).json({ message: req.__("controller.account.descriptionLengthError") });
    }

    if (name.length > 64) {
      return res.status(400).json({ message: req.__("controller.account.nameLengthError") });
    }

    const account = await Account.create({
      ...req.body,
      owner: userId
    });

    if (balance && balance != 0) {
      await Transaction.create({
        account: account._id,
        amount: balance,
        owner: userId,
        date: new Date(),
        description: req.__("controller.account.initialBalance")
      });
    }

    res.status(201).json({ message: req.__("controller.account.createdSuccess"), content: account });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

export const updateAccount = async (req, res) => {
  const accountId = req.params.id;
  const userId = req.user.id;
  const { description, name } = req.body;
  try {

    req.body.balance = (await Account.findById(accountId)).balance;
    req.body.owner = userId;

    if (description && description.length > 128) {
      return res.status(400).json({ message: req.__("controller.account.descriptionLengthError") });
    }

    if (name && name.length > 64) {
      return res.status(400).json({ message: req.__("controller.account.nameLengthError") });
    }

    const account = await Account.findOneAndUpdate(
      { _id: accountId, owner: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!account) return res.status(404).json({ message: req.__("controller.account.notFound") });

    res.status(200).json({ message: req.__("controller.account.updatedSuccess"), content: account });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

export const deleteAccount = async (req, res) => {
  const accountId = req.params.id;
  const userId = req.user.id;
  const { backupAccount } = req.query;

  try {
    const account = await Account.findOneAndDelete({ _id: accountId, owner: userId });
    if (!account) return res.status(404).json({ message: req.__("controller.account.notFound") });

    if (backupAccount && backupAccount !== '') {
      await Transaction.updateMany(
        { account: accountId },
        { $set: { account: backupAccount } }
      );
      await Account.findByIdAndUpdate(
        backupAccount,
        { $inc: { balance: account.balance } }
      );
    } else {
      await Transaction.deleteMany({ account: accountId });
    }
    res.status(200).json({ message: req.__("controller.account.deletedSuccess") });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

import { Transaction } from "../models/transactions.models.js";
import { Account } from "../models/accounts.models.js";

export const getUserTransactions = async (req, res) => {
  const userId = req.user.id;
  const {
    page = 1,
    limit = 10,
    sortBy = 'date',
    sort = 'desc',
    description,
    fromDate,
    toDate,
    account
  } = req.query;

  try {
    if (isNaN(page) || isNaN(limit) || page < 1) {
      return res
        .status(400)
        .json({ message: req.__("common.paginationPositiveInteger") });
    }

    const filters = { owner: userId };

    if (description) {
      filters.description = { $regex: description, $options: "i" };
    }

    if (account && account !== 'all') {
      filters.account = account;
    }

    if (fromDate || toDate) {
      filters.date = {};
      if (fromDate) filters.date.$gte = new Date(fromDate);
      if (toDate) filters.date.$lte = new Date(toDate);
    }

    let query = Transaction.find(filters).select("-account").sort({ [sortBy]: sort === 'desc' ? -1 : 1 });

    if (limit > 0) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const [transactions, total] = await Promise.all([
      query.exec(),
      Transaction.countDocuments(filters),
    ]);

    res.status(200).json({
      page: limit > 0 ? Number(page) : 1,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
      content: transactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

export const getTransactionById = async (req, res) => {
  const transactionId = req.params.id;
  const userId = req.user.id;

  try {
    const transaction = await Transaction.findOne({ _id: transactionId, owner: userId });
    if (!transaction) return res.status(404).json({ message: req.__("controller.transaction.notFound") });

    res.status(200).json({ content: transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

export const createTransaction = async (req, res) => {
  const { description, amount, account, date } = req.body;
  const userId = req.user.id;

  try {
    if (!description || !account) {
      return res.status(400).json({ message: req.__("controller.transaction.requiredFields") });
    }

    if (isNaN(amount)) {
      return res.status(400).json({ message: req.__("controller.transaction.amountNumberError") });
    }

    if (date && isNaN(Date.parse(date))) {
      return res.status(400).json({ message: req.__("controller.transaction.dateFormatError") });
    }

    if (date) {
      req.body.date = new Date(new Date(date).setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds(), new Date().getMilliseconds()));
    } else {
      req.body.date = new Date();
    }

    if (description.length > 64) {
      return res.status(400).json({ message: req.__("controller.transaction.descriptionLengthError") });
    }

    const transaction = await Transaction.create({
      ...req.body,
      owner: userId
    });

    await Account.findByIdAndUpdate(account, { $inc: { balance: amount } }).exec();

    res.status(201).json({ message: req.__("controller.transaction.createdSuccess"), content: transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") } );
  }
}

export const updateTransaction = async (req, res) => {
  const transactionId = req.params.id;
  const userId = req.user.id;
  const { description, amount, date, account } = req.body;
  try {

    req.body.owner = userId;

    if (amount && isNaN(amount)) {
      return res.status(400).json({ message: req.__("controller.transaction.amountNumberError") });
    }

    if (date && isNaN(Date.parse(date))) {
      return res.status(400).json({ message: req.__("controller.transaction.dateFormatError") });
    }

    if (description && description.length > 64) {
      return res.status(400).json({ message: req.__("controller.transaction.descriptionLengthError") });
    }

    let previousAccountId = null;
    if (account) {
      const accountExists = await Account.findOne({ _id: account, owner: userId });
      previousAccountId = (await Transaction.findOne({ _id: transactionId, owner: userId })).account.toString();
      if (!accountExists) {
        return res.status(400).json({ message: req.__("controller.transaction.accountNotFound") } );
      }
    }

    let difference = 0;

    if (amount) {
      const oldTransaction = await Transaction.findOne({ _id: transactionId, owner: userId });
      if (!oldTransaction) return res.status(404).json({ message: req.__("controller.transaction.notFound") });

      difference = amount - oldTransaction.amount;
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, owner: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) return res.status(404).json({ message: req.__("controller.transaction.notFound") });

    if (account && account !== previousAccountId) {
      await Account.findByIdAndUpdate(previousAccountId, { $inc: { balance: -transaction.amount } }).exec();
      await Account.findByIdAndUpdate(account, { $inc: { balance: amount || transaction.amount } }).exec();
    }

    if (difference !== 0) {
      await Account.findByIdAndUpdate(transaction.account, { $inc: { balance: difference } }).exec();
    }

    res.status(200).json({ message: req.__("controller.transaction.updatedSuccess"), content: transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") } );
  }
}

export const deleteTransaction = async (req, res) => {
  const transactionId = req.params.id;
  const userId = req.user.id;

  try {
    const transaction = await Transaction.findOneAndDelete({ _id: transactionId, owner: userId });
    if (!transaction) return res.status(404).json({ message: req.__("controller.transaction.notFound") });

    await Account.findByIdAndUpdate(transaction.account, { $inc: { balance: -transaction.amount } }).exec();

    res.status(200).json({ message: req.__("controller.transaction.deletedSuccess") });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.__("common.serverError") } );
  }
}

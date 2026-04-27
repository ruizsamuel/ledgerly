import { ObjectId } from "mongodb";
import { DbSession } from "../common/models/basic.model.js";
import { executeInTransaction } from "../common/utils/database.utils.js";
import { transactionRepository } from "../repositories/transaction.repository.js";
import { accountRepository } from "../repositories/account.repository.js";
import type { ListTransactionDTO, NewTransactionDTO, UpdateTransactionDTO } from "../domain/models/transaction.model.js";

export const transactionsService = {
  async listByUser(userId: string, options: ListTransactionDTO) {
    const match: Record<string, unknown> = { owner: new ObjectId(userId) };

    if (options.description) {
      match.description = { $regex: options.description, $options: "i" };
    }

    if (options.account && options.account !== "all") {
      match.account = new ObjectId(options.account);
    }

    if (options.fromDate || options.toDate) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};
      if (options.fromDate) dateFilter.$gte = new Date(options.fromDate);
      if (options.toDate) dateFilter.$lte = new Date(options.toDate);
      match.date = dateFilter;
    }

    const sortValue = options.sort === "desc" ? -1 : 1;

    return transactionRepository.listByToken(match, {
      page: options.page,
      limit: options.limit,
      sortBy: options.sortBy,
      sortValue
    });
  },

  async getById(userId: string, transactionId: string) {
    return transactionRepository.findById(userId, transactionId);
  },

  async create(userId: string, input: NewTransactionDTO) {
    const accountExists = await accountRepository.findById(userId, input.account);
    if (!accountExists) throw new Error("accountNotFound");

    return executeInTransaction(async (session: DbSession) => {
      const transaction = await transactionRepository.create(userId, input, session);
      if (transaction) {
        await accountRepository.addBalance(transaction.account, transaction.amount, session);
      }
      return transaction;
    });
  },

  async update(userId: string, transactionId: string, input: UpdateTransactionDTO) {
    const existing = await transactionRepository.findById(userId, transactionId);
    if (!existing) return null;

    const hasAccountChange = Boolean(input.account && input.account !== existing.account);
    const nextAccountId = input.account ?? existing.account;
    const nextAmount = input.amount ?? existing.amount;

    if (hasAccountChange && input.account) {
      const accountExists = await accountRepository.findById(userId, input.account);
      if (!accountExists) throw new Error("accountNotFound");
    }

    return executeInTransaction(async (session: DbSession) => {
      if (hasAccountChange) {
        await accountRepository.addBalance(existing.account, -existing.amount, session);
        await accountRepository.addBalance(nextAccountId, nextAmount, session);
      } else if (input.amount !== undefined) {
        const difference = input.amount - existing.amount;
        await accountRepository.addBalance(existing.account, difference, session);
      }

      return transactionRepository.update(userId, transactionId, input, session);
    });
  },

  async delete(userId: string, transactionId: string) {
    const deleted = await transactionRepository.findById(userId, transactionId);
    if (!deleted) return null;

    return executeInTransaction(async (session: DbSession) => {
      await transactionRepository.delete(userId, transactionId, session);
      await accountRepository.addBalance(deleted.account, -deleted.amount, session);
      return { id: deleted.id, amount: deleted.amount, account: deleted.account };
    });
  }
};

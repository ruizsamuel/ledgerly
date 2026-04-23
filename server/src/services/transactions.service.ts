import { DbSession } from "../common/models/basic.model.js";
import { executeInTransaction } from "../common/utils/database.utils.js";
import { transactionRepository } from "../repositories/transaction.repository.js";
import { accountRepository } from "../repositories/account.repository.js";
import type { NewTransactionInput, UpdateTransactionInput } from "../domain/models/transaction.model.js";

export const transactionsService = {
  async listByUser(userId: string, options: {
    page: number;
    limit: number;
    sortBy: "date" | "amount";
    sort: "asc" | "desc";
    description?: string;
    fromDate?: Date;
    toDate?: Date;
    account?: string;
  }) {
    return transactionRepository.listByToken({ ownerId: userId, ...options });
  },

  async getById(userId: string, transactionId: string) {
    return transactionRepository.findById(userId, transactionId);
  },

  async create(userId: string, input: NewTransactionInput) {
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

  async update(userId: string, transactionId: string, input: UpdateTransactionInput) {
    const existing = await transactionRepository.findById(userId, transactionId);
    if (!existing) return null;

    if (input.account && input.account !== existing.account) {
      const accountExists = await accountRepository.findById(userId, input.account);
      if (!accountExists) throw new Error("accountNotFound");
    }

    return executeInTransaction(async (session: DbSession) => {
      if (input.account && input.account !== existing.account) {
        await accountRepository.addBalance(existing.account, -existing.amount, session);
      }

      if (input.amount !== undefined) {
        const difference = input.amount - existing.amount;
        await accountRepository.addBalance(input.account ?? existing.account, difference, session);
      } else if (input.account && input.account !== existing.account) {
        await accountRepository.addBalance(input.account, existing.amount, session);
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

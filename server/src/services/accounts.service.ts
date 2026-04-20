import { ClientSession } from "mongodb";
import { executeInTransaction } from "../common/utils/database.utils.js";
import { accountRepository } from "../repositories/account.repository.js";
import { transactionRepository } from "../repositories/transaction.repository.js";
import type { NewAccountInput, UpdateAccountInput } from "../domain/models/account.model.js";

export const accountsService = {
  async listByUser(userId: string, options: { page: number; limit: number }) {
    return accountRepository.listByToken(userId, options);
  },

  async getById(userId: string, accountId: string) {
    return accountRepository.findById(userId, accountId);
  },

  async create(userId: string, input: NewAccountInput, initialBalanceDescription: string) {
    return executeInTransaction(async (session: ClientSession) => {
      const account = await accountRepository.create(userId, input, session);
      if (!account) return null;

      if (input.balance && input.balance !== 0) {
        await transactionRepository.create(userId, {
          account: account.id,
          amount: input.balance,
          description: initialBalanceDescription,
          date: new Date().toISOString()
        }, session);
      }

      return account;
    });
  },

  async update(userId: string, accountId: string, input: UpdateAccountInput) {
    return accountRepository.update(userId, accountId, input);
  },

  async delete(userId: string, accountId: string, backupAccountId?: string) {
    const deleted = await accountRepository.delete(userId, accountId);
    if (!deleted) return null;

    return executeInTransaction(async (session: ClientSession) => {
      if (backupAccountId) {
        await accountRepository.updateTransactionsAccount(accountId, backupAccountId, session);
        await accountRepository.addBalance(backupAccountId, deleted.balance, session);
      } else {
        await accountRepository.deleteTransactionsByAccount(accountId, session);
      }
      return deleted;
    });
  }
};

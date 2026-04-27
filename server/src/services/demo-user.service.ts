import { hash } from "bcrypt";
import { userRepository } from "../repositories/user.repository.js";
import { accountRepository } from "../repositories/account.repository.js";
import { transactionRepository } from "../repositories/transaction.repository.js";
import { settingsRepository } from "../repositories/settings.repository.js";
import { DEMO_EMAIL, DEMO_NAME, demomockdata } from "../domain/constants/demo-data.js";

export const demoUserService = {
  async createDemoUser() {
    const existing = await userRepository.findByEmail(DEMO_EMAIL);
    if (existing) return;

    // Hash demo password properly
    const hashedPassword = await hash("demo", 10);
    await userRepository.create({
      name: DEMO_NAME,
      email: DEMO_EMAIL,
      password: hashedPassword,
      isAdmin: false
    });
  },

  async getDemoUserId() {
    const user = await userRepository.findByEmail(DEMO_EMAIL);
    return user ? user.id.toString() : null;
  },


  async resetDemoUserData() {
    const demoUserId = await this.getDemoUserId();
    if (!demoUserId) return;

    await transactionRepository.deleteByToken(demoUserId);
    const existingAccounts = await accountRepository.listByToken(demoUserId, {
      page: 1,
      limit: 0
    });
    for (const account of existingAccounts.accounts) {
      await accountRepository.delete(demoUserId, account.id);
    }

    const accountMap: Record<string, string> = {};
    for (const accountData of demomockdata.accounts) {
      const account = await accountRepository.create(demoUserId, {
        name: accountData.name,
        balance: 0,
        description: accountData.description
      });

      if (account) {
        accountMap[accountData.name] = account.id;

        if (accountData.balance !== 0) {
          await transactionRepository.create(demoUserId, {
            account: account.id,
            amount: accountData.balance,
            description: "Initial Balance",
            date: new Date().toISOString()
          });
          // Update balance after creating transaction
          await accountRepository.addBalance(account.id, accountData.balance);
        }
      }
    }

    for (const txnData of demomockdata.transactions) {
      // Use first account as default (should exist)
      const accountId = Object.values(accountMap)[0];
      if (accountId) {
        await transactionRepository.create(demoUserId, {
          account: accountId,
          amount: txnData.amount,
          description: txnData.description,
          date: txnData.date
        });
        // Update balance after creating transaction
        await accountRepository.addBalance(accountId, txnData.amount);
      }
    }
  },

  async isDemoUserEnabled() {
    const settings = await settingsRepository.get();
    return settings?.allowDemoUser === true;
  }
};

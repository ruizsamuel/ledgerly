import { genSalt, hash } from "bcrypt";
import { PASSWORD_MIN_LENGTH } from "../common/utils/auth.utils.js";
import { userRepository } from "../repositories/user.repository.js";
import { transactionRepository } from "../repositories/transaction.repository.js";
import { accountRepository } from "../repositories/account.repository.js";
import type { NewUserInput, UpdateUserInput, User } from "../domain/models/user.model.js";

export const usersService = {
  async getById(id: string) {
    return userRepository.findById(id);
  },

  async getByToken(userId: string) {
    return userRepository.findById(userId);
  },

  async list(options: {
    page: number;
    limit: number;
    sortBy: string;
    sort: "asc" | "desc";
    searchTerm?: string;
  }) {
    return userRepository.list(options);
  },

  async create(input: NewUserInput) {
    if (!input.password || input.password.length < PASSWORD_MIN_LENGTH) {
      throw new Error("passwordMinLength");
    }

    const existing = await userRepository.findByEmailRaw(input.email);
    if (existing) throw new Error("emailInUse");

    const salt = await genSalt(10);
    const hashedPassword = await hash(input.password, salt);

    return userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      isAdmin: !!input.isAdmin
    });
  },

  async updateById(id: string, input: UpdateUserInput) {
    if (input.email) {
      const existing = await userRepository.findByEmailRaw(input.email);
      if (existing && existing._id.toString() !== id) {
        throw new Error("emailInUse");
      }
    }

    return userRepository.updateById(id, input);
  },

  async updateByToken(user: User, input: UpdateUserInput) {
    if (input.email && input.email !== user.email) {
      const existing = await userRepository.findByEmailRaw(input.email);
      if (existing) throw new Error("emailInUse");
    }

    return userRepository.updateById(user.id, input);
  },

  async deleteById(id: string) {
    await transactionRepository.deleteByToken(id);
    const accounts = await accountRepository.listByToken(id, { page: 1, limit: 0 });
    await Promise.all(accounts.accounts.map(account => accountRepository.delete(id, account.id)));
    return userRepository.deleteById(id);
  },

  async hasUsers() {
    const count = await userRepository.countAll();
    return count > 0;
  }
};

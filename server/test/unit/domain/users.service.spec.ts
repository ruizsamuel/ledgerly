import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/repositories/user.repository.js", () => ({
  userRepository: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    updateById: vi.fn(),
    countAll: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    deleteById: vi.fn()
  }
}));

vi.mock("../../../src/repositories/transaction.repository.js", () => ({
  transactionRepository: {
    deleteByToken: vi.fn()
  }
}));

vi.mock("../../../src/repositories/account.repository.js", () => ({
  accountRepository: {
    listByToken: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock("bcrypt", () => ({
  genSalt: vi.fn().mockResolvedValue("salt"),
  hash: vi.fn().mockResolvedValue("hashed-password")
}));

import { usersService } from "../../../src/services/users.service.js";
import { userRepository } from "../../../src/repositories/user.repository.js";
import { transactionRepository } from "../../../src/repositories/transaction.repository.js";
import { accountRepository } from "../../../src/repositories/account.repository.js";

describe("usersService (unit)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws passwordMinLength when password is too short", async () => {
    await expect(usersService.create({
      name: "A",
      email: "a@test.com",
      password: "123",
      isAdmin: false
    })).rejects.toThrow("passwordMinLength");
  });

  it("throws emailInUse when email already exists", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({ id: { toString: () => "x" } } as never);

    await expect(usersService.create({
      name: "A",
      email: "a@test.com",
      password: "12345678",
      isAdmin: false
    })).rejects.toThrow("emailInUse");
  });

  it("creates user with hashed password", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue({
      id: "u1",
      name: "User",
      email: "u@test.com",
      isAdmin: false
    });

    const user = await usersService.create({
      name: "User",
      email: "u@test.com",
      password: "12345678",
      isAdmin: false
    });

    expect(user?.id).toBe("u1");
    expect(userRepository.create).toHaveBeenCalled();
  });

  it("returns hasUsers true when count is positive", async () => {
    vi.mocked(userRepository.countAll).mockResolvedValue(2);

    await expect(usersService.hasUsers()).resolves.toBe(true);
  });

  it("deletes user data cascaded through transactions and accounts", async () => {
    vi.mocked(transactionRepository.deleteByToken).mockResolvedValue(undefined as never);
    vi.mocked(accountRepository.listByToken).mockResolvedValue({
      accounts: [{ id: "a1" }, { id: "a2" }],
      total: 2
    } as never);
    vi.mocked(accountRepository.delete).mockResolvedValue(null as never);
    vi.mocked(userRepository.deleteById).mockResolvedValue(undefined as never);

    await usersService.deleteById("u1");

    expect(transactionRepository.deleteByToken).toHaveBeenCalledWith("u1");
    expect(accountRepository.listByToken).toHaveBeenCalledWith("u1", { page: 1, limit: 0 });
    expect(accountRepository.delete).toHaveBeenCalledWith("u1", "a1");
    expect(accountRepository.delete).toHaveBeenCalledWith("u1", "a2");
    expect(userRepository.deleteById).toHaveBeenCalledWith("u1");
  });
});

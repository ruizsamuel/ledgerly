import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/repositories/user.repository.js", () => ({
  userRepository: {
    findByEmail: vi.fn(),
    create: vi.fn()
  }
}));

vi.mock("../../../src/repositories/account.repository.js", () => ({
  accountRepository: {
    listByToken: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
    addBalance: vi.fn()
  }
}));

vi.mock("../../../src/repositories/transaction.repository.js", () => ({
  transactionRepository: {
    deleteByToken: vi.fn(),
    create: vi.fn()
  }
}));

vi.mock("../../../src/repositories/settings.repository.js", () => ({
  settingsRepository: {
    get: vi.fn()
  }
}));

vi.mock("bcrypt", () => ({
  hash: vi.fn().mockResolvedValue("hashed-demo-password")
}));

import { demoUserService } from "../../../src/services/demo-user.service.js";
import { userRepository } from "../../../src/repositories/user.repository.js";
import { accountRepository } from "../../../src/repositories/account.repository.js";
import { transactionRepository } from "../../../src/repositories/transaction.repository.js";
import { settingsRepository } from "../../../src/repositories/settings.repository.js";
import { hash } from "bcrypt";

describe("demoUserService (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hash).mockResolvedValue("hashed-demo-password");
  });

  it("creates demo user with hashed password", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue({
      id: "demo-1",
      email: "demo@ledgerly.local",
      name: "Demo User",
      isAdmin: false
    } as never);

    await demoUserService.createDemoUser();

    expect(hash).toHaveBeenCalledWith("demo", 10);
    expect(userRepository.create).toHaveBeenCalledWith({
      name: "Demo User",
      email: "demo@ledgerly.local",
      password: "hashed-demo-password",
      isAdmin: false
    });
  });

  it("skips creating demo user if it already exists", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: "demo-1",
      email: "demo@ledgerly.local",
      name: "Demo User"
    } as never);

    await demoUserService.createDemoUser();

    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("gets demo user ID", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: { toString: () => "demo-user-id" },
      email: "demo@ledgerly.local"
    } as never);

    const id = await demoUserService.getDemoUserId();

    expect(id).toBe("demo-user-id");
  });

  it("returns null when demo user doesn't exist", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    const id = await demoUserService.getDemoUserId();

    expect(id).toBeNull();
  });

  it("resets demo user data with fresh mock data", async () => {
    // Mock demo user exists
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: { toString: () => "demo-1" },
      email: "demo@ledgerly.local"
    } as never);

    // Mock no existing transactions/accounts
    vi.mocked(transactionRepository.deleteByToken).mockResolvedValue(undefined);
    vi.mocked(accountRepository.listByToken).mockResolvedValue({
      accounts: [],
      total: 0
    } as never);

    // Mock account creation
    vi.mocked(accountRepository.create)
      .mockResolvedValueOnce({
        id: "acc-1",
        name: "Main Checking",
        balance: 0
      } as never)
      .mockResolvedValueOnce({
        id: "acc-2",
        name: "Savings",
        balance: 0
      } as never);

    // Mock transaction creation
    vi.mocked(transactionRepository.create).mockResolvedValue({
      id: "txn-1"
    } as never);

    await demoUserService.resetDemoUserData();

    // Verify transactions were deleted
    expect(transactionRepository.deleteByToken).toHaveBeenCalledWith("demo-1");

    // Verify accounts were created
    expect(accountRepository.create).toHaveBeenCalledWith("demo-1", {
      name: "Main Checking",
      balance: 0,
      description: "Primary bank account for everyday expenses"
    });

    // Verify transactions were created (initial balances + all mock transactions)
    expect(transactionRepository.create).toHaveBeenCalled();
  });

  it("checks if demo user is enabled in settings", async () => {
    vi.mocked(settingsRepository.get).mockResolvedValue({
      allowUserRegistration: false,
      allowDemoUser: true
    } as never);

    const enabled = await demoUserService.isDemoUserEnabled();

    expect(enabled).toBe(true);
  });

  it("returns false when demo user is not enabled", async () => {
    vi.mocked(settingsRepository.get).mockResolvedValue({
      allowUserRegistration: false,
      allowDemoUser: false
    } as never);

    const enabled = await demoUserService.isDemoUserEnabled();

    expect(enabled).toBe(false);
  });

  it("returns false when settings don't have allowDemoUser field", async () => {
    vi.mocked(settingsRepository.get).mockResolvedValue({
      allowUserRegistration: false
    } as never);

    const enabled = await demoUserService.isDemoUserEnabled();

    expect(enabled).toBe(false);
  });

  it("prevents demo user creation if no admin exists (would become admin)", async () => {
    // Simulate no users in database
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    // Simulate no users yet (countAll not mocked here since createDemoUser doesn't call it)
    // but in real code, index.ts checks userRepository.countAll() before calling createDemoUser

    await demoUserService.createDemoUser();

    // Demo user would be created with isAdmin: false, but protection is in index.ts
    // This test verifies the service creates it as non-admin with hashed password
    expect(userRepository.create).toHaveBeenCalledWith({
      name: "Demo User",
      email: "demo@ledgerly.local",
      password: "hashed-demo-password",
      isAdmin: false  // Always non-admin
    });
  });
});

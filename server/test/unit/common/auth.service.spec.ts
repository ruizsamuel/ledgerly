import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/repositories/user.repository.js", () => ({
  userRepository: {
    findByEmailWithPassword: vi.fn(),
    findById: vi.fn(),
    countAll: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    findByIdWithPassword: vi.fn(),
    updatePassword: vi.fn()
  }
}));

vi.mock("../../../src/repositories/settings.repository.js", () => ({
  settingsRepository: {
    get: vi.fn(),
    upsert: vi.fn()
  }
}));

vi.mock("bcrypt", () => ({
  compare: vi.fn(),
  genSalt: vi.fn().mockResolvedValue("salt"),
  hash: vi.fn().mockResolvedValue("hashed-password")
}));

vi.mock("../../../src/services/demo-user.service.js", () => ({
  demoUserService: {
    isDemoUserEnabled: vi.fn(),
    resetDemoUserData: vi.fn()
  }
}));

import { compare, hash } from "bcrypt";
import { authService } from "../../../src/services/auth.service.js";
import { userRepository } from "../../../src/repositories/user.repository.js";
import { settingsRepository } from "../../../src/repositories/settings.repository.js";
import { demoUserService } from "../../../src/services/demo-user.service.js";

describe("authService (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws invalidCredentials when user is missing", async () => {
    vi.mocked(userRepository.findByEmailWithPassword).mockResolvedValue(null);

    await expect(authService.login({ email: "missing@user.com", password: "secret" }))
      .rejects
      .toThrow("invalidCredentials");
  });

  it("returns user on successful login", async () => {
    vi.mocked(userRepository.findByEmailWithPassword).mockResolvedValue({
      id: { toString: () => "u1" },
      password: "hashed"
    } as never);
    vi.mocked(compare).mockResolvedValue(true as never);
    vi.mocked(userRepository.findById).mockResolvedValue({
      id: "u1",
      email: "user@test.com",
      name: "User",
      isAdmin: false
    });

    const user = await authService.login({ email: "user@test.com", password: "secret" });

    expect(user?.id).toBe("u1");
    expect(userRepository.findById).toHaveBeenCalledWith("u1");
  });

  it("registers first user as admin and updates settings", async () => {
    vi.mocked(userRepository.countAll).mockResolvedValue(0);
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue({
      id: "admin-1",
      email: "admin@test.com",
      name: "Admin",
      isAdmin: true
    });

    const user = await authService.register({
      name: "Admin",
      email: "admin@test.com",
      password: "secret123",
      confirmPassword: "secret123"
    });

    expect(user?.isAdmin).toBe(true);
    expect(settingsRepository.upsert).toHaveBeenCalledWith({ allowUserRegistration: false, allowDemoUser: true });
  });

  it("blocks registration when disabled in settings", async () => {
    vi.mocked(userRepository.countAll).mockResolvedValue(1);
    vi.mocked(settingsRepository.get).mockResolvedValue({ allowUserRegistration: false } as never);

    await expect(authService.register({
      name: "Blocked",
      email: "blocked@test.com",
      password: "secret123",
      confirmPassword: "secret123"
    })).rejects.toThrow("registrationDisabled");
  });

  it("throws incorrectPassword when current password does not match", async () => {
    vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue({
      id: { toString: () => "u1" },
      password: "hashed"
    } as never);
    vi.mocked(compare).mockResolvedValue(false as never);

    await expect(authService.changePassword(
      { id: "u1", name: "User", email: "user@test.com", isAdmin: false },
      { currentPassword: "wrong", newPassword: "new-secret" }
    )).rejects.toThrow("incorrectPassword");
  });

  it("updates password when the current password matches", async () => {
    vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue({
      id: { toString: () => "u1" },
      password: "hashed"
    } as never);
    vi.mocked(compare).mockResolvedValue(true as never);
    vi.mocked(hash).mockResolvedValue("hashed-password");

    await authService.changePassword(
      { id: "u1", name: "User", email: "user@test.com", isAdmin: false },
      { currentPassword: "secret", newPassword: "new-secret" }
    );

    expect(userRepository.updatePassword).toHaveBeenCalledWith("u1", "hashed-password");
  });

  it("resets demo user data on demo login when enabled", async () => {
    vi.mocked(userRepository.findByEmailWithPassword).mockResolvedValue({
      id: { toString: () => "demo-1" },
      password: "hashed"
    } as never);
    vi.mocked(compare).mockResolvedValue(true as never);
    vi.mocked(demoUserService.isDemoUserEnabled).mockResolvedValue(true);
    vi.mocked(demoUserService.resetDemoUserData).mockResolvedValue(undefined);
    vi.mocked(userRepository.findById).mockResolvedValue({
      id: "demo-1",
      email: "demo@ledgerly.local",
      name: "Demo User",
      isAdmin: false
    });

    const user = await authService.login({ email: "demo@ledgerly.local", password: "demo" });

    expect(demoUserService.isDemoUserEnabled).toHaveBeenCalled();
    expect(demoUserService.resetDemoUserData).toHaveBeenCalled();
    expect(user?.email).toBe("demo@ledgerly.local");
  });

  it("blocks demo login when demo is disabled", async () => {
    vi.mocked(userRepository.findByEmailWithPassword).mockResolvedValue({
      id: { toString: () => "demo-1" },
      password: "hashed"
    } as never);
    vi.mocked(compare).mockResolvedValue(true as never);
    vi.mocked(demoUserService.isDemoUserEnabled).mockResolvedValue(false);

    await expect(authService.login({ email: "demo@ledgerly.local", password: "demo" }))
      .rejects
      .toThrow("invalidCredentials");

    expect(demoUserService.resetDemoUserData).not.toHaveBeenCalled();
  });
});

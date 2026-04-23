import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { connectDb } from "../../../src/common/utils/database.utils.js";
import { clearDatabase } from "../../helpers/db-cleanup.js";
import { startMongoContainer, stopMongoContainer } from "../../helpers/mongo-test-container.js";
import { userRepository } from "../../../src/repositories/user.repository.js";

describe("userRepository (integration)", () => {
  beforeAll(async () => {
    await startMongoContainer();
    await connectDb();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await stopMongoContainer();
  });

  it("creates a user and retrieves it by id", async () => {
    const created = await userRepository.create({
      name: "Alice",
      email: "alice@test.com",
      password: "hashed",
      isAdmin: false
    });

    expect(created).not.toBeNull();

    const loaded = await userRepository.findById(String(created?.id));
    expect(loaded?.email).toBe("alice@test.com");
  });

  it("returns the right count with countAll", async () => {
    await userRepository.create({ name: "A", email: "a@test.com", password: "x", isAdmin: false });
    await userRepository.create({ name: "B", email: "b@test.com", password: "x", isAdmin: false });

    await expect(userRepository.countAll()).resolves.toBe(2);
  });
});

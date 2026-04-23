import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { app } from "../../../src/index.js";
import { connectDb } from "../../../src/common/utils/database.utils.js";
import { initI18n } from "../../../src/common/utils/translator.utils.js";
import { clearDatabase } from "../../helpers/db-cleanup.js";
import { startMongoContainer, stopMongoContainer } from "../../helpers/mongo-test-container.js";

const registerAndGetToken = async (
  name: string,
  email: string,
  password = "secret123"
) => {
  const response = await request(app)
    .post("/api/auth/register")
    .send({ name, email, password, confirmPassword: password });

  expect(response.status).toBe(201);
  const token = response.body.content?.token as string | undefined;
  expect(token).toBeTruthy();
  return token as string;
};

const loginAndGetToken = async (email: string, password: string) => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  expect(response.status).toBe(201);
  const token = response.body.content?.token as string | undefined;
  expect(token).toBeTruthy();
  return token as string;
};

describe("settings API (functional, domain)", () => {
  beforeAll(async () => {
    await startMongoContainer();
    await connectDb();
    initI18n();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await stopMongoContainer();
  });

  describe("authorization", () => {
    it("blocks non-admin users from settings routes", async () => {
      const adminToken = await registerAndGetToken("Admin", "admin.block.settings@test.com");

      const createResponse = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Second",
          email: "second.block.settings@test.com",
          password: "secret123",
          isAdmin: false
        });

      expect(createResponse.status).toBe(201);

      const userToken = await loginAndGetToken("second.block.settings@test.com", "secret123");

      const settingsResponse = await request(app)
        .get("/api/settings")
        .set("Authorization", `Bearer ${userToken}`);

      expect(settingsResponse.status).toBe(403);
    });
  });

  describe("admin settings", () => {
    it("reads and updates settings as admin", async () => {
      const adminToken = await registerAndGetToken("Admin", "admin.settings@test.com");

      const initialResponse = await request(app)
        .get("/api/settings")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(initialResponse.status).toBe(200);
      expect(initialResponse.body.content?.allowUserRegistration).toBe(false);

      const updateResponse = await request(app)
        .put("/api/settings")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ allowUserRegistration: true });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.content?.allowUserRegistration).toBe(true);

      const finalResponse = await request(app)
        .get("/api/settings")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(finalResponse.status).toBe(200);
      expect(finalResponse.body.content?.allowUserRegistration).toBe(true);
    });
  });
});

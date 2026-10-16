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

describe("users API (functional, common)", () => {
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

  describe("admin CRUD", () => {
    it("covers admin users CRUD and user deletion", async () => {
      const adminToken = await registerAndGetToken("Admin", "admin.users@test.com");

      const createResponse = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Second",
          email: "second.user@test.com",
          password: "secret123",
          isAdmin: false
        });

      expect(createResponse.status).toBe(201);
      const userId = createResponse.body.content?.id as string;
      expect(userId).toBeTruthy();

      const listResponse = await request(app)
        .get("/api/users?page=1&limit=10")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.content).toHaveLength(3);

      const getResponse = await request(app)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.content?.email).toBe("second.user@test.com");

      const updateResponse = await request(app)
        .patch(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Second Updated" });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.content?.name).toBe("Second Updated");

      const deleteResponse = await request(app)
        .delete(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);

      const afterDelete = await request(app)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(afterDelete.status).toBe(404);
    });
  });

  describe("authorization", () => {
    it("blocks non-admin users from users admin routes", async () => {
      const adminToken = await registerAndGetToken("Admin", "admin.block.users@test.com");

      const createResponse = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Second",
          email: "second.block.users@test.com",
          password: "secret123",
          isAdmin: false
        });

      expect(createResponse.status).toBe(201);

      const userToken = await loginAndGetToken("second.block.users@test.com", "secret123");

      const usersResponse = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(usersResponse.status).toBe(403);
    });
  });
  describe("privilege boundaries", () => {
    it("does not let a regular user grant itself admin through /me", async () => {
      const adminToken = await registerAndGetToken("Admin", "admin.escalation@test.com");

      const createResponse = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Regular", email: "regular@test.com", password: "secret123", isAdmin: false });
      expect(createResponse.status).toBe(201);

      const userToken = await loginAndGetToken("regular@test.com", "secret123");

      const escalation = await request(app)
        .patch("/api/users/me")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Still regular", isAdmin: true });
      expect(escalation.status).toBe(200);
      expect(escalation.body.content?.isAdmin).toBe(false);

      const me = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${userToken}`);
      expect(me.status).toBe(200);
      expect(me.body.content?.isAdmin).toBe(false);

      const adminOnly = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${userToken}`);
      expect(adminOnly.status).toBe(403);
    });

    it("does not let the demo user change its profile or password", async () => {
      await registerAndGetToken("Admin", "admin.demo@test.com");
      const demoToken = await loginAndGetToken("demo@ledgerly.local", "demo");

      const profile = await request(app)
        .patch("/api/users/me")
        .set("Authorization", `Bearer ${demoToken}`)
        .send({ email: "hijacked@test.com" });
      expect(profile.status).toBe(403);

      const password = await request(app)
        .patch("/api/auth/change-password")
        .set("Authorization", `Bearer ${demoToken}`)
        .send({ currentPassword: "demo", newPassword: "hijacked123" });
      expect(password.status).toBe(403);

      const stillDemo = await loginAndGetToken("demo@ledgerly.local", "demo");
      expect(stillDemo).toBeTruthy();
    });
  });
});

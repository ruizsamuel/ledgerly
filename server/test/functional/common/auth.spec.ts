import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { app } from "../../../src/index.js";
import { connectDb } from "../../../src/common/utils/database.utils.js";
import { initI18n } from "../../../src/common/utils/translator.utils.js";
import { clearDatabase } from "../../helpers/db-cleanup.js";
import { startMongoContainer, stopMongoContainer } from "../../helpers/mongo-test-container.js";

const getRefreshCookie = (response: { headers: { [key: string]: unknown } }) => {
  const cookies = response.headers["set-cookie"] as string[] | undefined;
  const refreshCookie = cookies?.find(cookie => cookie.startsWith("refreshToken="));
  expect(refreshCookie).toBeTruthy();
  return refreshCookie as string;
};

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

describe("auth + users API (functional)", () => {
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

  describe("users bootstrap", () => {
    it("returns false for /api/users/has-users on empty db", async () => {
      const response = await request(app).get("/api/users/has-users");

      expect(response.status).toBe(200);
      expect(response.body.content).toBe(false);
    });

    it("registers a user and then /api/users/has-users becomes true", async () => {
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Admin",
          email: "admin@test.com",
          password: "secret123",
          confirmPassword: "secret123"
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.content?.token).toBeTruthy();

      const hasUsersResponse = await request(app).get("/api/users/has-users");
      expect(hasUsersResponse.status).toBe(200);
      expect(hasUsersResponse.body.content).toBe(true);
    });

    it("rejects register when passwords do not match", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Admin",
          email: "admin-mismatch@test.com",
          password: "secret123",
          confirmPassword: "secret456"
        });

      expect(response.status).toBe(400);
    });
  });

  describe("sessions", () => {
    it("logs in, refreshes and logs out a session", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Admin",
          email: "admin-session@test.com",
          password: "secret123",
          confirmPassword: "secret123"
        });

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin-session@test.com", password: "secret123" });

      expect(loginResponse.status).toBe(201);
      expect(loginResponse.body.content?.token).toBeTruthy();

      const refreshCookie = getRefreshCookie(loginResponse);

      const refreshResponse = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", refreshCookie)
        .send({});

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.content?.token).toBeTruthy();

      const logoutResponse = await request(app)
        .delete("/api/auth/logout")
        .set("Cookie", refreshCookie);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.headers["set-cookie"]).toBeTruthy();
    });

    it("returns 400 on invalid login credentials", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Admin",
          email: "admin-login@test.com",
          password: "secret123",
          confirmPassword: "secret123"
        });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin-login@test.com", password: "wrong-password" });

      expect(response.status).toBe(400);
    });

    it("returns 401 on refresh when no cookie token exists", async () => {
      const response = await request(app).post("/api/auth/refresh").send({});

      expect(response.status).toBe(401);
    });
  });

  describe("current user", () => {
    it("loads and updates the current user through /api/users/me", async () => {
      const token = await registerAndGetToken("Admin", "admin.me@test.com");

      const meResponse = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.content?.email).toBe("admin.me@test.com");

      const updateResponse = await request(app)
        .patch("/api/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Admin Updated" });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.content?.name).toBe("Admin Updated");
    });

    it("changes password and rejects the old one", async () => {
      const token = await registerAndGetToken("Admin", "admin.password@test.com");

      const changeResponse = await request(app)
        .patch("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({ currentPassword: "secret123", newPassword: "newsecret123" });

      expect(changeResponse.status).toBe(200);

      const oldLoginResponse = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin.password@test.com", password: "secret123" });

      expect(oldLoginResponse.status).toBe(400);

      const newLoginResponse = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin.password@test.com", password: "newsecret123" });

      expect(newLoginResponse.status).toBe(201);
    });
  });
});

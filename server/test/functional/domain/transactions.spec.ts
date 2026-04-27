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

const createAccount = async (token: string, payload: { name: string; balance: number; description?: string }) => {
  const response = await request(app)
    .post("/api/accounts")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

  expect(response.status).toBe(201);
  return response.body.content as { id: string; name: string; balance: number };
};

const getAccountBalance = async (token: string, accountId: string) => {
  const response = await request(app)
    .get(`/api/accounts/${accountId}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  return Number(response.body.content.balance);
};

describe("transactions API (functional)", () => {
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

  describe("transaction lifecycle", () => {
    it("runs full CRUD on transactions and syncs account balance", async () => {
      const token = await registerAndGetToken("Admin", "admin.tx-crud@test.com");
      const account = await createAccount(token, { name: "Main", balance: 0 });

      const created = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 120,
          description: "salary",
          account: account.id,
          date: new Date().toISOString()
        });

      expect(created.status).toBe(201);
      const transactionId = created.body.content?.id as string;
      expect(transactionId).toBeTruthy();
      expect(await getAccountBalance(token, account.id)).toBe(120);

      const byId = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(byId.status).toBe(200);
      expect(byId.body.content?.amount).toBe(120);

      const updated = await request(app)
        .patch(`/api/transactions/${transactionId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 150, description: "salary adjusted" });

      expect(updated.status).toBe(200);
      expect(updated.body.content?.amount).toBe(150);
      expect(await getAccountBalance(token, account.id)).toBe(150);

      const deleted = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(deleted.status).toBe(200);
      expect(await getAccountBalance(token, account.id)).toBe(0);

      const afterDelete = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(afterDelete.status).toBe(404);
    });

    it("moves balance correctly when updating transaction account", async () => {
      const token = await registerAndGetToken("Admin", "admin.tx-move@test.com");
      const source = await createAccount(token, { name: "Source", balance: 0 });
      const target = await createAccount(token, { name: "Target", balance: 0 });

      const created = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 70,
          description: "move me",
          account: source.id,
          date: new Date().toISOString()
        });

      expect(created.status).toBe(201);
      const txId = created.body.content?.id as string;

      expect(await getAccountBalance(token, source.id)).toBe(70);
      expect(await getAccountBalance(token, target.id)).toBe(0);

      const moved = await request(app)
        .patch(`/api/transactions/${txId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ account: target.id });

      expect(moved.status).toBe(200);
      expect(moved.body.content?.account).toBe(target.id);

      expect(await getAccountBalance(token, source.id)).toBe(0);
      expect(await getAccountBalance(token, target.id)).toBe(70);
    });

    it("adds balance in destination account when moving a positive transaction", async () => {
      const token = await registerAndGetToken("Admin", "admin.tx-move-positive@test.com");
      const source = await createAccount(token, { name: "Source", balance: 0 });
      const target = await createAccount(token, { name: "Target", balance: 100 });

      const created = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 40,
          description: "positive move",
          account: source.id,
          date: new Date().toISOString()
        });

      expect(created.status).toBe(201);
      const txId = created.body.content?.id as string;

      const moved = await request(app)
        .patch(`/api/transactions/${txId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ account: target.id });

      expect(moved.status).toBe(200);
      expect(await getAccountBalance(token, source.id)).toBe(0);
      expect(await getAccountBalance(token, target.id)).toBe(140);
    });

    it("subtracts balance in destination account when moving a negative transaction", async () => {
      const token = await registerAndGetToken("Admin", "admin.tx-move-negative@test.com");
      const source = await createAccount(token, { name: "Source", balance: 0 });
      const target = await createAccount(token, { name: "Target", balance: 100 });

      const created = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: -40,
          description: "negative move",
          account: source.id,
          date: new Date().toISOString()
        });

      expect(created.status).toBe(201);
      const txId = created.body.content?.id as string;

      const moved = await request(app)
        .patch(`/api/transactions/${txId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ account: target.id });

      expect(moved.status).toBe(200);
      expect(await getAccountBalance(token, source.id)).toBe(0);
      expect(await getAccountBalance(token, target.id)).toBe(60);
    });

    it("updates balances correctly when moving transaction and changing amount at once", async () => {
      const token = await registerAndGetToken("Admin", "admin.tx-move-and-amount@test.com");
      const source = await createAccount(token, { name: "Source", balance: 0 });
      const target = await createAccount(token, { name: "Target", balance: 100 });

      const created = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 70,
          description: "move and change amount",
          account: source.id,
          date: new Date().toISOString()
        });

      expect(created.status).toBe(201);
      const txId = created.body.content?.id as string;

      const moved = await request(app)
        .patch(`/api/transactions/${txId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ account: target.id, amount: 30 });

      expect(moved.status).toBe(200);
      expect(await getAccountBalance(token, source.id)).toBe(0);
      expect(await getAccountBalance(token, target.id)).toBe(130);
    });

    it("applies amount difference when updating transaction amount", async () => {
      const token = await registerAndGetToken("Admin", "admin.tx-diff@test.com");
      const account = await createAccount(token, { name: "Diff", balance: 10 });

      const created = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 40,
          description: "initial",
          account: account.id,
          date: new Date().toISOString()
        });

      expect(created.status).toBe(201);
      const txId = created.body.content?.id as string;

      expect(await getAccountBalance(token, account.id)).toBe(50);

      const updated = await request(app)
        .patch(`/api/transactions/${txId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 15 });

      expect(updated.status).toBe(200);
      expect(await getAccountBalance(token, account.id)).toBe(25);
    });
  });

  describe("validation and listing", () => {
    it("returns 400 when creating or updating transaction with non-existing account", async () => {
      const token = await registerAndGetToken("Admin", "admin.tx-account-missing@test.com");
      const account = await createAccount(token, { name: "Valid", balance: 0 });
      const missingAccount = "507f191e810c19729de860ea";

      const createWithMissing = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 10,
          description: "bad",
          account: missingAccount,
          date: new Date().toISOString()
        });

      expect(createWithMissing.status).toBe(400);

      const created = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 10,
          description: "ok",
          account: account.id,
          date: new Date().toISOString()
        });

      expect(created.status).toBe(201);
      const txId = created.body.content?.id as string;

      const updateWithMissing = await request(app)
        .patch(`/api/transactions/${txId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ account: missingAccount });

      expect(updateWithMissing.status).toBe(400);
    });

    it("supports listing with account filter and sort", async () => {
      const token = await registerAndGetToken("Admin", "admin.tx-filter@test.com");
      const a1 = await createAccount(token, { name: "A1", balance: 0 });
      const a2 = await createAccount(token, { name: "A2", balance: 0 });

      const now = Date.now();
      const olderDate = new Date(now - 1000 * 60).toISOString();
      const newerDate = new Date(now).toISOString();

      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 30, description: "a1-t1", account: a1.id, date: olderDate });

      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 10, description: "a1-t2", account: a1.id, date: newerDate });

      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 99, description: "a2-t1", account: a2.id, date: newerDate });

      const filtered = await request(app)
        .get(`/api/transactions?account=${a1.id}&sortBy=amount&sort=asc&limit=50&page=1`)
        .set("Authorization", `Bearer ${token}`);

      expect(filtered.status).toBe(200);
      expect(filtered.body.content).toHaveLength(2);
      expect(filtered.body.content[0].amount).toBe(10);
      expect(filtered.body.content[1].amount).toBe(30);
    });

    it("paginates only the requesting user's transactions", async () => {
      const adminToken = await registerAndGetToken("Admin", "admin.tx-pagination@test.com");
      const adminAccount = await createAccount(adminToken, { name: "Admin account", balance: 0 });

      const createUserResponse = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Second",
          email: "second.tx-pagination@test.com",
          password: "secret123",
          isAdmin: false
        });

      expect(createUserResponse.status).toBe(201);

      const otherToken = await loginAndGetToken("second.tx-pagination@test.com", "secret123");
      const otherAccount = await createAccount(otherToken, { name: "Other account", balance: 0 });

      const adminTransactions = [
        { amount: 5, description: "admin-1", date: new Date(Date.now() - 3000).toISOString() },
        { amount: 10, description: "admin-2", date: new Date(Date.now() - 2000).toISOString() },
        { amount: 15, description: "admin-3", date: new Date(Date.now() - 1000).toISOString() }
      ];

      for (const tx of adminTransactions) {
        const response = await request(app)
          .post("/api/transactions")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ ...tx, account: adminAccount.id });

        expect(response.status).toBe(201);
      }

      for (const amount of [20, 25]) {
        const response = await request(app)
          .post("/api/transactions")
          .set("Authorization", `Bearer ${otherToken}`)
          .send({
            amount,
            description: `other-${amount}`,
            account: otherAccount.id,
            date: new Date().toISOString()
          });

        expect(response.status).toBe(201);
      }

      const pageOne = await request(app)
        .get("/api/transactions?page=1&limit=2&sortBy=date&sort=asc")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(pageOne.status).toBe(200);
      expect(pageOne.body.page).toBe(1);
      expect(pageOne.body.totalPages).toBe(2);
      expect(pageOne.body.content).toHaveLength(2);
      for (const tx of pageOne.body.content as Array<{ description: string }>) {
        expect(tx.description.startsWith("admin-")).toBe(true);
        expect(tx.description.startsWith("other-")).toBe(false);
      }

      const pageTwo = await request(app)
        .get("/api/transactions?page=2&limit=2&sortBy=date&sort=asc")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(pageTwo.status).toBe(200);
      expect(pageTwo.body.page).toBe(2);
      expect(pageTwo.body.totalPages).toBe(2);
      expect(pageTwo.body.content).toHaveLength(1);
      for (const tx of pageTwo.body.content as Array<{ description: string }>) {
        expect(tx.description.startsWith("admin-")).toBe(true);
        expect(tx.description.startsWith("other-")).toBe(false);
      }
    });
  });

  describe("missing resources", () => {
    it("returns 404 when transaction does not exist", async () => {
      const token = await registerAndGetToken("Admin", "admin.tx-not-found@test.com");
      const nonExisting = "507f191e810c19729de860ff";

      const getRes = await request(app)
        .get(`/api/transactions/${nonExisting}`)
        .set("Authorization", `Bearer ${token}`);

      expect(getRes.status).toBe(404);

      const delRes = await request(app)
        .delete(`/api/transactions/${nonExisting}`)
        .set("Authorization", `Bearer ${token}`);

      expect(delRes.status).toBe(404);
    });
  });
});

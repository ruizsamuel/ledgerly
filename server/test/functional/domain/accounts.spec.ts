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
  expect(response.body.content?.id).toBeTruthy();
  return response.body.content as { id: string; name: string; balance: number; description?: string };
};

const getAccountById = async (token: string, accountId: string) => {
  const response = await request(app)
    .get(`/api/accounts/${accountId}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  return response.body.content as { id: string; name: string; balance: number; description?: string };
};

describe("accounts API (functional)", () => {
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

  describe("account lifecycle", () => {
    it("runs full CRUD on accounts", async () => {
      const token = await registerAndGetToken("Admin", "admin.accounts@test.com");

      const created = await createAccount(token, {
        name: "Wallet",
        balance: 0,
        description: "main"
      });

      const listResponse = await request(app)
        .get("/api/accounts?page=1&limit=10")
        .set("Authorization", `Bearer ${token}`);

      expect(listResponse.status).toBe(200);
      expect(Array.isArray(listResponse.body.content)).toBe(true);
      expect(listResponse.body.content).toHaveLength(1);

      const loaded = await getAccountById(token, created.id);
      expect(loaded.name).toBe("Wallet");

      const updateResponse = await request(app)
        .patch(`/api/accounts/${created.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Wallet 2", description: "updated" });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.content?.name).toBe("Wallet 2");

      const deleteResponse = await request(app)
        .delete(`/api/accounts/${created.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);

      const afterDelete = await request(app)
        .get(`/api/accounts/${created.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(afterDelete.status).toBe(404);
    });
  });

  describe("balance bookkeeping", () => {
    it("creates initial balance transaction when account balance is not zero", async () => {
      const token = await registerAndGetToken("Admin", "admin.initial@test.com");

      const created = await createAccount(token, {
        name: "Savings",
        balance: 250,
        description: "starter"
      });

      expect(created.balance).toBe(250);

      const transactionsResponse = await request(app)
        .get(`/api/transactions?account=${created.id}&limit=50&page=1`)
        .set("Authorization", `Bearer ${token}`);

      expect(transactionsResponse.status).toBe(200);
      expect(transactionsResponse.body.content).toHaveLength(1);
      expect(transactionsResponse.body.content[0].amount).toBe(250);
    });

    it("deletes account with fallback: transfers transactions and balance", async () => {
      const token = await registerAndGetToken("Admin", "admin.fallback@test.com");

      const source = await createAccount(token, { name: "Source", balance: 100 });
      const backup = await createAccount(token, { name: "Backup", balance: 20 });

      const expense = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: -40,
          description: "expense",
          account: source.id,
          date: new Date().toISOString()
        });

      expect(expense.status).toBe(201);

      const deleteResponse = await request(app)
        .delete(`/api/accounts/${source.id}?backupAccount=${backup.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);

      const sourceAfterDelete = await request(app)
        .get(`/api/accounts/${source.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(sourceAfterDelete.status).toBe(404);

      const backupAfter = await getAccountById(token, backup.id);
      expect(backupAfter.balance).toBe(80);

      const backupTransactions = await request(app)
        .get(`/api/transactions?account=${backup.id}&limit=50&page=1`)
        .set("Authorization", `Bearer ${token}`);

      expect(backupTransactions.status).toBe(200);
      const movedAmounts = backupTransactions.body.content.map((tx: { amount: number }) => tx.amount);
      expect(movedAmounts).toContain(100);
      expect(movedAmounts).toContain(-40);
    });

    it("deletes account without fallback: removes its transactions", async () => {
      const token = await registerAndGetToken("Admin", "admin.no-fallback@test.com");

      const account = await createAccount(token, { name: "Disposable", balance: 10 });

      const txResponse = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 15,
          description: "extra",
          account: account.id,
          date: new Date().toISOString()
        });

      expect(txResponse.status).toBe(201);

      const deleteResponse = await request(app)
        .delete(`/api/accounts/${account.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);

      const transactionsAfterDelete = await request(app)
        .get(`/api/transactions?account=${account.id}&limit=50&page=1`)
        .set("Authorization", `Bearer ${token}`);

      expect(transactionsAfterDelete.status).toBe(200);
      expect(transactionsAfterDelete.body.content).toHaveLength(0);
    });
  });

  describe("multi-user isolation", () => {
    it("paginates only the requesting user's accounts", async () => {
      const adminToken = await registerAndGetToken("Admin", "admin.pagination@test.com");

      const adminAccountNames = ["Admin A", "Admin B", "Admin C"];
      const otherAccountNames = ["Other A", "Other B"];

      for (const name of adminAccountNames) {
        await createAccount(adminToken, { name, balance: 0 });
      }

      const createUserResponse = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Second",
          email: "second.pagination@test.com",
          password: "secret123",
          isAdmin: false
        });

      expect(createUserResponse.status).toBe(201);

      const otherToken = await loginAndGetToken("second.pagination@test.com", "secret123");

      for (const name of otherAccountNames) {
        await createAccount(otherToken, { name, balance: 0 });
      }

      const pageOne = await request(app)
        .get("/api/accounts?page=1&limit=2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(pageOne.status).toBe(200);
      expect(pageOne.body.page).toBe(1);
      expect(pageOne.body.totalPages).toBe(2);
      expect(pageOne.body.content).toHaveLength(2);
      for (const account of pageOne.body.content as Array<{ name: string }>) {
        expect(adminAccountNames).toContain(account.name);
        expect(otherAccountNames).not.toContain(account.name);
      }

      const pageTwo = await request(app)
        .get("/api/accounts?page=2&limit=2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(pageTwo.status).toBe(200);
      expect(pageTwo.body.page).toBe(2);
      expect(pageTwo.body.totalPages).toBe(2);
      expect(pageTwo.body.content).toHaveLength(1);
      for (const account of pageTwo.body.content as Array<{ name: string }>) {
        expect(adminAccountNames).toContain(account.name);
        expect(otherAccountNames).not.toContain(account.name);
      }
    });

    it("isolates account visibility between users", async () => {
      const adminToken = await registerAndGetToken("Admin", "admin.isolation@test.com");

      const createUserResponse = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Second",
          email: "second@test.com",
          password: "secret123",
          isAdmin: false
        });

      expect(createUserResponse.status).toBe(201);

      const secondToken = await loginAndGetToken("second@test.com", "secret123");

      const adminAccount = await createAccount(adminToken, {
        name: "Admin account",
        balance: 5
      });

      const secondCanSee = await request(app)
        .get(`/api/accounts/${adminAccount.id}`)
        .set("Authorization", `Bearer ${secondToken}`);

      expect(secondCanSee.status).toBe(404);
    });
  });
});

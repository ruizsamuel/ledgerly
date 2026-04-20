import { ObjectId, ClientSession } from "mongodb";
import { getDb } from "../common/utils/database.utils.js";
import type { Account, NewAccountInput, UpdateAccountInput } from "../domain/models/account.model.js";

const collection = () => getDb().collection("accounts");

export const accountRepository = {
  async listByToken(userId: string, options: { page: number; limit: number }, session?: ClientSession) {
    const owner = new ObjectId(userId);
    const pipeline: Record<string, unknown>[] = [
      { $match: { owner } },
      {
        $project: {
          id: "$_id",
          _id: 0,
          name: 1,
          balance: 1,
          description: 1
        }
      }
    ];

    if (options.limit > 0) {
      pipeline.push({ $skip: (options.page - 1) * options.limit }, { $limit: options.limit });
    }

    const [docs, total] = await Promise.all([
      collection().aggregate<Account>(pipeline, { session }).toArray(),
      collection().countDocuments({ owner }, { session })
    ]);

    return {
      accounts: docs,
      total
    };
  },

  async findById(ownerId: string, accountId: string, session?: ClientSession): Promise<Account | null> {
    const doc = await collection().findOne({
      _id: new ObjectId(accountId),
      owner: new ObjectId(ownerId)
    }, { projection: { owner: 0 }, session });
    return doc ? { id: doc._id.toString(), name: doc.name, balance: doc.balance, description: doc.description } : null;
  },

  async create(ownerId: string, input: NewAccountInput, session?: ClientSession): Promise<Account | null> {
    const result = await collection().insertOne({
      name: input.name,
      balance: input.balance,
      description: input.description,
      owner: new ObjectId(ownerId)
    } as any, { session });
    const doc = await collection().findOne({ _id: result.insertedId }, { projection: { owner: 0 }, session });
    return doc ? { id: doc._id.toString(), name: doc.name, balance: doc.balance, description: doc.description } : null;
  },

  async update(ownerId: string, accountId: string, input: UpdateAccountInput & { balance?: number }, session?: ClientSession): Promise<Account | null> {
    await collection().updateOne(
      { _id: new ObjectId(accountId), owner: new ObjectId(ownerId) },
      { $set: input },
      { session }
    );
    const doc = await collection().findOne({
      _id: new ObjectId(accountId),
      owner: new ObjectId(ownerId)
    }, { projection: { owner: 0 }, session });
    return doc ? { id: doc._id.toString(), name: doc.name, balance: doc.balance, description: doc.description } : null;
  },

  async delete(ownerId: string, accountId: string, session?: ClientSession): Promise<Account | null> {
    const doc = await collection().findOne({
      _id: new ObjectId(accountId),
      owner: new ObjectId(ownerId)
    }, { projection: { owner: 0 }, session });
    if (!doc) return null;
    await collection().deleteOne({
      _id: new ObjectId(accountId),
      owner: new ObjectId(ownerId)
    }, { session });
    return { id: doc._id.toString(), name: doc.name, balance: doc.balance, description: doc.description };
  },

  async addBalance(accountId: string, amount: number, session?: ClientSession) {
    await collection().updateOne(
      { _id: new ObjectId(accountId) },
      { $inc: { balance: amount } },
      { session }
    );
  },

  async deleteTransactionsByAccount(accountId: string, session?: ClientSession) {
    await getDb().collection("transactions").deleteMany(
      { account: new ObjectId(accountId) },
      { session }
    );
  },

  async updateTransactionsAccount(accountId: string, backupAccountId: string, session?: ClientSession) {
    await getDb().collection("transactions").updateMany(
      { account: new ObjectId(accountId) },
      { $set: { account: new ObjectId(backupAccountId) } },
      { session }
    );
  }
};

import { ObjectId, ClientSession } from "mongodb";
import { getDb } from "../common/utils/database.utils.js";
import type { Account, NewAccountDTO, UpdateAccountDTO } from "../domain/models/account.model.js";

const collection = () => getDb().collection("accounts");

const ACCOUNT_PROJECT_STAGE = {
  $project: {
    _id: 0,
    id: "$_id",
    name: 1,
    balance: 1,
    description: 1
  }
};

export const accountRepository = {
  async _findOneWithProjection(filter: object, session?: ClientSession): Promise<Account | null> {
    const [doc] = await collection().aggregate<Account>([
      { $match: filter },
      ACCOUNT_PROJECT_STAGE
    ], { session }).toArray();
    return doc || null;
  },

  async listByToken(userId: string, options: { page: number; limit: number }, session?: ClientSession): Promise<{accounts: Account[], total: number}>  {
    const owner = new ObjectId(userId);
    const pipeline: any[] = [{ $match: { owner } }];

    if (options.limit > 0) {
      pipeline.push(
        { $skip: (options.page - 1) * options.limit },
        { $limit: options.limit }
      );
    }

    pipeline.push(ACCOUNT_PROJECT_STAGE);

    const [docs, total] = await Promise.all([
      collection().aggregate<Account>(pipeline, { session }).toArray(),
      collection().countDocuments({ owner }, { session })
    ]);

    return { accounts: docs, total };
  },

  async findById(ownerId: string, accountId: string, session?: ClientSession): Promise<Account | null> {
    return this._findOneWithProjection({
      _id: new ObjectId(accountId),
      owner: new ObjectId(ownerId)
    }, session);
  },

  async create(ownerId: string, input: NewAccountDTO, session?: ClientSession): Promise<Account | null> {
    const result = await collection().insertOne({
      ...input,
      owner: new ObjectId(ownerId)
    }, { session });

    return this._findOneWithProjection({ _id: result.insertedId }, session);
  },

  async update(ownerId: string, accountId: string, input: UpdateAccountDTO & { balance?: number }, session?: ClientSession): Promise<Account | null> {
    const filter = { _id: new ObjectId(accountId), owner: new ObjectId(ownerId) };
    await collection().updateOne(filter, { $set: input }, { session });
    return this._findOneWithProjection(filter, session);
  },

  async delete(ownerId: string, accountId: string, session?: ClientSession): Promise<Account | null> {
    const filter = { _id: new ObjectId(accountId), owner: new ObjectId(ownerId) };
    const doc = await this._findOneWithProjection(filter, session);
    if (!doc) return null;

    await collection().deleteOne(filter, { session });
    return doc;
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

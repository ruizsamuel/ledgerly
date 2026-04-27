import { ObjectId, ClientSession } from "mongodb";
import { getDb } from "../common/utils/database.utils.js";
import type { NewTransactionDTO, Transaction, TransactionBasic, UpdateTransactionDTO } from "../domain/models/transaction.model.js";

const collection = () => getDb().collection("transactions");

const TRANSACTION_PROJECT_STAGE = {
  $project: {
    _id: 0,
    id: "$_id",
    amount: 1,
    description: 1,
    date: { $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$date" } },
    account: { $toString: "$account" }
  }
};

export const transactionRepository = {
  async _findOneWithProjection(filter: object, session?: ClientSession): Promise<Transaction | null> {
    const [doc] = await collection().aggregate<Transaction>([
      { $match: filter },
      TRANSACTION_PROJECT_STAGE
    ], { session }).toArray();
    return doc || null;
  },

  async listByToken(match: Record<string, unknown>, options: { page: number; limit: number; sortBy: string; sortValue: number }, session?: ClientSession): Promise<{transactions: TransactionBasic[], total: number}> {
    const pipeline: any[] = [
      { $match: match },
      { $sort: { [options.sortBy]: options.sortValue } }
    ];

    if (options.limit > 0) {
      pipeline.push({ $skip: (options.page - 1) * options.limit }, { $limit: options.limit });
    }

    pipeline.push(TRANSACTION_PROJECT_STAGE);

    const [docs, total] = await Promise.all([
      collection().aggregate<TransactionBasic>(pipeline, { session }).toArray(),
      collection().countDocuments(match, { session })
    ]);

    return { transactions: docs, total };
  },

  async findById(ownerId: string, transactionId: string, session?: ClientSession): Promise<Transaction | null> {
    return this._findOneWithProjection({
      _id: new ObjectId(transactionId),
      owner: new ObjectId(ownerId)
    }, session);
  },

  async create(userId: string, input: NewTransactionDTO, session?: ClientSession): Promise<Transaction | null> {
    const documentToInsert = {
      owner: new ObjectId(userId),
      account: new ObjectId(input.account),
      amount: input.amount,
      description: input.description,
      date: input.date ? new Date(input.date) : new Date()
    };
    const result = await collection().insertOne(documentToInsert, { session });
    return this._findOneWithProjection({ _id: result.insertedId }, session);
  },

  async update(ownerId: string, transactionId: string, updateData: UpdateTransactionDTO, session?: ClientSession): Promise<Transaction | null> {
    const filter = { _id: new ObjectId(transactionId), owner: new ObjectId(ownerId) };
    const normalizedUpdateData: any = {};

    // Only include fields that are explicitly provided (not undefined)
    if (updateData.amount !== undefined) normalizedUpdateData.amount = updateData.amount;
    if (updateData.description !== undefined) normalizedUpdateData.description = updateData.description;
    if (updateData.date !== undefined) normalizedUpdateData.date = new Date(updateData.date);
    if (updateData.account !== undefined) normalizedUpdateData.account = new ObjectId(updateData.account);

    await collection().updateOne(filter, { $set: normalizedUpdateData }, { session });
    return this._findOneWithProjection(filter, session);
  },

  async delete(ownerId: string, transactionId: string, session?: ClientSession): Promise<Transaction | null> {
    const filter = { _id: new ObjectId(transactionId), owner: new ObjectId(ownerId) };
    const doc = await this._findOneWithProjection(filter, session);
    if (!doc) return null;

    await collection().deleteOne(filter, { session });
    return doc;
  },

  async deleteByToken(userId: string, session?: ClientSession) {
    await collection().deleteMany({ owner: new ObjectId(userId) }, { session });
  }
};

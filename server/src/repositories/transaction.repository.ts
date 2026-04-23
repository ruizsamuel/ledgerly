import { ObjectId, ClientSession } from "mongodb";
import { getDb } from "../common/utils/database.utils.js";
import type { Transaction, TransactionBasic, NewTransactionInput, UpdateTransactionInput } from "../domain/models/transaction.model.js";

const collection = () => getDb().collection("transactions");

export const transactionRepository = {
  async listByToken(options: {
    ownerId: string;
    page: number;
    limit: number;
    sortBy: "date" | "amount";
    sort: "asc" | "desc";
    description?: string;
    fromDate?: Date;
    toDate?: Date;
    account?: string;
  }, session?: ClientSession) {
    const match: Record<string, unknown> = { owner: new ObjectId(options.ownerId) };

    if (options.description) {
      match.description = { $regex: options.description, $options: "i" };
    }

    if (options.account && options.account !== "all") {
      match.account = new ObjectId(options.account);
    }

    if (options.fromDate || options.toDate) {
      match.date = {};
      if (options.fromDate) (match.date as Record<string, unknown>).$gte = options.fromDate;
      if (options.toDate) (match.date as Record<string, unknown>).$lte = options.toDate;
    }

    const sortValue = options.sort === "desc" ? -1 : 1;
    const pipeline: Record<string, unknown>[] = [
      { $match: match },
      { $sort: { [options.sortBy]: sortValue } },
      {
        $project: {
          id: "$_id",
          _id: 0,
          amount: 1,
          description: 1,
          date: { $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$date" } }
        }
      }
    ];

    if (options.limit > 0) {
      pipeline.push({ $skip: (options.page - 1) * options.limit }, { $limit: options.limit });
    }

    const [docs, total] = await Promise.all([
      collection().aggregate<TransactionBasic>(pipeline, { session }).toArray(),
      collection().countDocuments(match, { session })
    ]);

    return {
      transactions: docs,
      total
    };
  },

  async findById(ownerId: string, transactionId: string, session?: ClientSession): Promise<Transaction | null> {
    const doc = await collection().findOne({
      _id: new ObjectId(transactionId),
      owner: new ObjectId(ownerId)
    }, { session });
    return doc ? {
      id: doc._id.toString(),
      amount: doc.amount,
      description: doc.description,
      date: doc.date.toISOString(),
      account: doc.account.toString()
    } : null;
  },

  async create(ownerId: string, input: NewTransactionInput, session?: ClientSession): Promise<Transaction | null> {
    const date = input.date ? new Date(input.date) : new Date();
    const result = await collection().insertOne({
      owner: new ObjectId(ownerId),
      amount: input.amount,
      description: input.description,
      date,
      account: new ObjectId(input.account)
    } as any, { session });
    const doc = await collection().findOne({ _id: result.insertedId }, { session });
    return doc ? {
      id: doc._id.toString(),
      amount: doc.amount,
      description: doc.description,
      date: doc.date.toISOString(),
      account: doc.account.toString()
    } : null;
  },

  async update(ownerId: string, transactionId: string, input: UpdateTransactionInput, session?: ClientSession): Promise<Transaction | null> {
    const updateDoc: Record<string, unknown> = {};
    if (input.amount !== undefined) updateDoc.amount = input.amount;
    if (input.description !== undefined) updateDoc.description = input.description;
    if (input.account !== undefined) updateDoc.account = new ObjectId(input.account);
    if (input.date !== undefined) updateDoc.date = new Date(input.date);

    if (Object.keys(updateDoc).length > 0) {
      await collection().updateOne(
        { _id: new ObjectId(transactionId), owner: new ObjectId(ownerId) },
        { $set: updateDoc },
        { session }
      );
    }

    const doc = await collection().findOne({
      _id: new ObjectId(transactionId),
      owner: new ObjectId(ownerId)
    }, { session });
    return doc ? {
      id: doc._id.toString(),
      amount: doc.amount,
      description: doc.description,
      date: doc.date.toISOString(),
      account: doc.account.toString()
    } : null;
  },

  async delete(ownerId: string, transactionId: string, session?: ClientSession): Promise<Transaction | null> {
    const doc = await collection().findOne({
      _id: new ObjectId(transactionId),
      owner: new ObjectId(ownerId)
    }, { session });
    if (!doc) return null;
    await collection().deleteOne({
      _id: new ObjectId(transactionId),
      owner: new ObjectId(ownerId)
    }, { session });
    return {
      id: doc._id.toString(),
      amount: doc.amount,
      description: doc.description,
      date: doc.date.toISOString(),
      account: doc.account.toString()
    };
  },

  async deleteByToken(userId: string, session?: ClientSession) {
    await collection().deleteMany({ owner: new ObjectId(userId) }, { session });
  }
};

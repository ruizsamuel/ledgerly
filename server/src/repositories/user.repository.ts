import { ObjectId, ClientSession } from "mongodb";
import { getDb } from "../common/utils/database.utils.js";
import type { User, NewUserInput, UpdateUserInput } from "../domain/models/user.model.js";

const collection = () => getDb().collection("users");

export const userRepository = {
  async findByEmailRaw(email: string, session?: ClientSession) {
    return collection().findOne({ email }, { session });
  },

  async findByEmailWithPassword(email: string, session?: ClientSession) {
    return collection().findOne({ email }, { projection: { password: 1, name: 1, email: 1, isAdmin: 1 }, session });
  },

  async findById(id: string, session?: ClientSession): Promise<User | null> {
    const doc = await collection().findOne({ _id: new ObjectId(id) }, { projection: { password: 0 }, session });
    return doc ? { id: doc._id.toString(), name: doc.name, email: doc.email, isAdmin: doc.isAdmin } : null;
  },

  async findByIdWithPassword(id: string, session?: ClientSession) {
    return collection().findOne({ _id: new ObjectId(id) }, { projection: { password: 1, name: 1, email: 1, isAdmin: 1 }, session });
  },

  async countAll(session?: ClientSession) {
    return collection().countDocuments({}, { session });
  },

  async list(options: {
    page: number;
    limit: number;
    sortBy: string;
    sort: "asc" | "desc";
    searchTerm?: string;
  }, session?: ClientSession) {
    const { page, limit, sortBy, sort, searchTerm } = options;
    const filters: Record<string, unknown> = {};

    if (searchTerm) {
      filters.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } }
      ];
    }

    const sortValue = sort === "desc" ? -1 : 1;
    const pipeline: Record<string, unknown>[] = [
      { $match: filters },
      { $sort: { [sortBy]: sortValue } },
      {
        $project: {
          id: "$_id",
          _id: 0,
          name: 1,
          email: 1,
          isAdmin: 1
        }
      }
    ];

    if (limit > 0) {
      pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });
    }

    const [docs, total] = await Promise.all([
      collection().aggregate<User>(pipeline, { session }).toArray(),
      collection().countDocuments(filters, { session })
    ]);

    return {
      users: docs,
      total
    };
  },

  async create(input: NewUserInput & { password: string; isAdmin: boolean }, session?: ClientSession): Promise<User | null> {
    const result = await collection().insertOne({
      name: input.name,
      email: input.email,
      password: input.password,
      isAdmin: input.isAdmin
    }, { session });

    const doc = await collection().findOne({ _id: result.insertedId }, { projection: { password: 0 }, session });
    return doc ? { id: doc._id.toString(), name: doc.name, email: doc.email, isAdmin: doc.isAdmin } : null;
  },

  async updateById(id: string, input: UpdateUserInput, session?: ClientSession): Promise<User | null> {
    await collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: input },
      { session }
    );
    const doc = await collection().findOne({ _id: new ObjectId(id) }, { projection: { password: 0 }, session });
    return doc ? { id: doc._id.toString(), name: doc.name, email: doc.email, isAdmin: doc.isAdmin } : null;
  },

  async updatePassword(id: string, password: string, session?: ClientSession) {
    await collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { password } },
      { session }
    );
  },

  async deleteById(id: string, session?: ClientSession): Promise<User | null> {
    const doc = await collection().findOne({ _id: new ObjectId(id) }, { projection: { password: 0 }, session });
    if (!doc) return null;
    await collection().deleteOne({ _id: new ObjectId(id) }, { session });
    return { id: doc._id.toString(), name: doc.name, email: doc.email, isAdmin: doc.isAdmin };
  }
};

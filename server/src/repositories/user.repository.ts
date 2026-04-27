import { ObjectId, ClientSession } from "mongodb";
import { getDb } from "../common/utils/database.utils.js";
import type { User, NewUserInput, UpdateUserInput, UserWithPassword } from "../domain/models/user.model.js";

const collection = () => getDb().collection("users");

const USER_PROJECT_STAGE = {
  $project: {
    id: "$_id",
    _id: 0,
    name: 1,
    email: 1,
    isAdmin: 1
  }
};

const AUTH_PROJECT_STAGE = {
  $project: {
    id: "$_id",
    _id: 0,
    name: 1,
    email: 1,
    isAdmin: 1,
    password: 1
  }
};

export const userRepository = {
  async _findOneWithProjection<T>(filter: object, projection: any, session?: ClientSession): Promise<T | null> {
    const docs = await collection().aggregate<any>([
      { $match: filter },
      projection
    ], { session }).toArray();

    return docs.length > 0 ? (docs[0] as T) : null;
  },

  async findByEmail(email: string, session?: ClientSession) {
    return this._findOneWithProjection<User>({ email }, USER_PROJECT_STAGE, session);
  },

  async findByEmailWithPassword(email: string, session?: ClientSession) {
    return this._findOneWithProjection<UserWithPassword>({ email }, AUTH_PROJECT_STAGE, session);
  },

  async findById(id: string, session?: ClientSession): Promise<User | null> {
    return this._findOneWithProjection<User>({ _id: new ObjectId(id) }, USER_PROJECT_STAGE, session);
  },

  async findByIdWithPassword(id: string, session?: ClientSession) {
    return this._findOneWithProjection<UserWithPassword>({ _id: new ObjectId(id) }, AUTH_PROJECT_STAGE, session);
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
    const pipeline: any[] = [
      { $match: filters },
      { $sort: { [sortBy]: sortValue } },
      USER_PROJECT_STAGE
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

    return this._findOneWithProjection<User>({ _id: result.insertedId }, USER_PROJECT_STAGE, session);
  },

  async updateById(id: string, input: UpdateUserInput, session?: ClientSession): Promise<User | null> {
    const filter = { _id: new ObjectId(id) };
    await collection().updateOne(filter, { $set: input }, { session });
    return this._findOneWithProjection<User>(filter, USER_PROJECT_STAGE, session);
  },

  async updatePassword(id: string, password: string, session?: ClientSession) {
    await collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { password } },
      { session }
    );
  },

  async deleteById(id: string, session?: ClientSession): Promise<User | null> {
    const filter = { _id: new ObjectId(id) };
    const doc = await this._findOneWithProjection<User>(filter, USER_PROJECT_STAGE, session);

    if (!doc) return null;

    await collection().deleteOne(filter, { session });
    return doc;
  }
};

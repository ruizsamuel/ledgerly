import { Db, MongoClient } from "mongodb";
import { DbSession } from "../models/basic.model.js";

const getDbName = () => process.env.MONGO_DB || "ledgerly";
const getRetryCount = () => Number(process.env.MONGO_CONNECT_RETRIES ?? 30);
const getRetryDelay = () => Number(process.env.MONGO_CONNECT_RETRY_DELAY_MS ?? 2000);
const getServerSelectionTimeout = () =>
  Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS ?? 30000);

const getMongoUri = () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;

  const host = process.env.MONGO_HOST;
  const port = process.env.MONGO_PORT;
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;

  if (!host || !port) {
    throw new Error("Mongo connection variables are missing. Set MONGO_URI or MONGO_HOST/MONGO_PORT.");
  }

  return username && password
    ? `mongodb://${username}:${password}@${host}:${port}/?retryWrites=true`
    : `mongodb://${host}:${port}/?retryWrites=true`;
};

let client: MongoClient | null = null;
let db: Db | null = null;

export const connectDb = async (): Promise<Db> => {
  if (db) return db;

  const uri = getMongoUri();
  client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: getServerSelectionTimeout()
  });

  const maxRetries = getRetryCount();
  const retryDelayMs = getRetryDelay();

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.connect();
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        throw error;
      }
      console.warn(
        `Mongo not ready (attempt ${attempt}/${maxRetries}). Retrying in ${retryDelayMs}ms...`
      );
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }

  if (lastError) {
    throw lastError instanceof Error ? lastError : new Error("Could not connect to MongoDB");
  }

  db = client.db(getDbName());
  return db;
};

export const closeDb = async () => {
  if (client) {
    await client.close();
  }
  client = null;
  db = null;
};

export const getDb = (): Db => {
  if (!db) {
    throw new Error("Database not connected. Call connectDb first.");
  }
  return db;
};

export const executeInTransaction = async <T>(
  operation: (session: DbSession) => Promise<T>
): Promise<T> => {
  if (!client) {
    throw new Error("Database client not connected. Call connectDb first.");
  }

  const session = client.startSession();

  try {
    session.startTransaction();
    const result = await operation(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

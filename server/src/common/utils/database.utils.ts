import { Db, MongoClient, ClientSession } from "mongodb";

const {
  MONGO_HOST,
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_PORT,
  MONGO_DB
} = process.env;

const dbName = MONGO_DB || "ledgerly";
const MONGO_CONNECT_RETRIES = Number(process.env.MONGO_CONNECT_RETRIES ?? 30);
const MONGO_CONNECT_RETRY_DELAY_MS = Number(process.env.MONGO_CONNECT_RETRY_DELAY_MS ?? 2000);

let client: MongoClient | null = null;
let db: Db | null = null;

export const connectDb = async (): Promise<Db> => {
  if (db) return db;

  const uri = MONGO_USERNAME && MONGO_PASSWORD
    ? `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/?retryWrites=true`
    : `mongodb://${MONGO_HOST}:${MONGO_PORT}/?retryWrites=true`;
  client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2
  });

  let lastError: unknown;
  for (let attempt = 1; attempt <= MONGO_CONNECT_RETRIES; attempt++) {
    try {
      await client.connect();
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
      if (attempt === MONGO_CONNECT_RETRIES) {
        throw error;
      }
      console.warn(
        `Mongo not ready (attempt ${attempt}/${MONGO_CONNECT_RETRIES}). Retrying in ${MONGO_CONNECT_RETRY_DELAY_MS}ms...`
      );
      await new Promise(resolve => setTimeout(resolve, MONGO_CONNECT_RETRY_DELAY_MS));
    }
  }

  if (lastError) {
    throw lastError instanceof Error ? lastError : new Error("Could not connect to MongoDB");
  }

  db = client.db(dbName);
  return db;
};

export const getDb = (): Db => {
  if (!db) {
    throw new Error("Database not connected. Call connectDb first.");
  }
  return db;
};

export const executeInTransaction = async <T>(
  operation: (session: ClientSession) => Promise<T>
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

import {
  MongoDBContainer,
  type StartedMongoDBContainer
} from "@testcontainers/mongodb";
import { closeDb } from "../../src/common/utils/database.utils.js";

let mongoContainer: StartedMongoDBContainer | null = null;

export const startMongoContainer = async () => {
  if (mongoContainer) return mongoContainer;

  mongoContainer = await new MongoDBContainer("mongo:7.0").start();

  process.env.NODE_ENV = "test";
  process.env.MONGO_URI = `${mongoContainer.getConnectionString()}/?directConnection=true&replicaSet=rs0`;
  process.env.MONGO_DB = "ledgerly_test";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
  process.env.MONGO_CONNECT_RETRIES = "60";
  process.env.MONGO_CONNECT_RETRY_DELAY_MS = "500";
  process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS = "2000";

  return mongoContainer;
};

export const stopMongoContainer = async () => {
  await closeDb();
  if (mongoContainer) {
    await mongoContainer.stop();
    mongoContainer = null;
  }
};

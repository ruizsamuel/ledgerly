import { getDb } from "../../src/common/utils/database.utils.js";

export const clearDatabase = async () => {
  const db = getDb();
  const collections = await db.collections();

  await Promise.all(collections.map((collection) => collection.deleteMany({})));
};

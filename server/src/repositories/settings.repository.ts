import { ClientSession } from "mongodb";
import { getDb } from "../common/utils/database.utils.js";
import type { Settings } from "../domain/models/settings.model.js";

const collection = () => getDb().collection("settings");

export const settingsRepository = {
  async get(session?: ClientSession): Promise<Settings | null> {
    const doc = await collection().findOne({}, { projection: { _id: 0 }, session });
    return doc as Settings | null;
  },

  async upsert(input: Settings, session?: ClientSession): Promise<Settings> {
    await collection().updateOne(
      {},
      { $set: { allowUserRegistration: input.allowUserRegistration } },
      { upsert: true, session }
    );
    return input;
  }
};

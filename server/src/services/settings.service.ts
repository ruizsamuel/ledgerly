import { settingsRepository } from "../repositories/settings.repository.js";
import type { Settings } from "../domain/models/settings.model.js";

export const settingsService = {
  async get() {
    const settings = await settingsRepository.get();
    return settings || { allowUserRegistration: false, allowDemoUser: false };
  },

  async update(input: Settings) {
    return settingsRepository.upsert(input);
  }
};

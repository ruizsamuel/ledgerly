import { Settings } from "../models/settings.models.js";

export const getSettings = async (_req, res) => {
  const settings = await Settings.findOne();
  res.json({ allowUserRegistration: settings?.allowUserRegistration ?? false });
}

export const updateSettings = async (req, res) => {
  try {
    const { allowUserRegistration } = req.body;
    const settings = await Settings.findOne();

    if (settings) {
      settings.allowUserRegistration = allowUserRegistration;
      await settings.save();
    } else {
      await Settings.create({ allowUserRegistration });
    }

    res.status(200).json({ message: "Settings updated successfully", content: { allowUserRegistration } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

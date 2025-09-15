import { Settings } from "../models/settings.models.js";

export const getSettings = async (_req, res) => {
  const settings = await Settings.findOne();
  res.status(200).json({ allowUserRegistration: settings?.allowUserRegistration ?? false });
}

// TODO: Hacer este modelo más sofisticado, con más opciones
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

    res.status(200).json({ message: req.__("common.updatedSuccess"), content: { allowUserRegistration } });
  } catch (err) {
    res.status(500).json({ message: req.__("common.serverError") });
  }
}

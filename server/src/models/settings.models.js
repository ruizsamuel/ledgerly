import { Schema, model } from "mongoose";

const settingSchema = new Schema({
  allowUserRegistration: { type: Boolean, default: false },
}, { timestamps: true });

export const Settings = model("Setting", settingSchema);

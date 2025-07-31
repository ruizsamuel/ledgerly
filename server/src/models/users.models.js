import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    isAdmin: { type: Boolean, default: false }
  }
);

const transformFunction = function (_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
}

userSchema.set('toJSON', { transform: transformFunction });
userSchema.set('toObject', { transform: transformFunction });

export const User = model("User", userSchema);

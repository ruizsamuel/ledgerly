import { Schema, model } from "mongoose";

const accountSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    balance: { type: Number, required: true, default: 0 },
    description: { type: String, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  }
);

const transformFunction = function (_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.owner;
    return ret;
}

accountSchema.set('toJSON', { transform: transformFunction });
accountSchema.set('toObject', { transform: transformFunction });

export const Account = model("Account", accountSchema);

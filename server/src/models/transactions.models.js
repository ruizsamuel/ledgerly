import { Schema, model } from "mongoose";

const transactionSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true, maxlength: 64 },
    date: { type: Date, default: Date.now },
    account: { type: Schema.Types.ObjectId, ref: "Account", required: true }
    // TODO: Add categories
  }
);

const transformFunction = function (_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.owner;
    return ret;
}

transactionSchema.set('toJSON', { transform: transformFunction });
transactionSchema.set('toObject', { transform: transformFunction });

export const Transaction = model("Transaction", transactionSchema);

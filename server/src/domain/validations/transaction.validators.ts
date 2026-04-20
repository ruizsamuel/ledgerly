import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z.number(),
  description: z.string().min(1).max(64),
  date: z.string().optional().refine((value) => value === undefined || !Number.isNaN(Date.parse(value)), {
    message: "Invalid date"
  }),
  account: z.string().min(1)
});

export const updateTransactionSchema = z.object({
  amount: z.number().optional(),
  description: z.string().min(1).max(64).optional(),
  date: z.string().optional().refine((value) => value === undefined || !Number.isNaN(Date.parse(value)), {
    message: "Invalid date"
  }),
  account: z.string().min(1).optional()
});

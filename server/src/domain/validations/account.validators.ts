import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1).max(64),
  balance: z.number(),
  description: z.string().max(128).optional()
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  description: z.string().max(128).optional()
});

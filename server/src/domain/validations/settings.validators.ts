import { z } from "zod";

export const settingsSchema = z.object({
  allowUserRegistration: z.boolean().optional(),
  allowDemoUser: z.boolean().optional()
}).strict();

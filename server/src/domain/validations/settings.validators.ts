import { z } from "zod";

export const settingsSchema = z.object({
  allowUserRegistration: z.boolean()
});

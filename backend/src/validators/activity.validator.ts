import { z } from "zod";

export const createActivitySchema = z.object({
  activity_type: z.enum(["CALL", "CHAT", "VISIT"]),
  notes: z.string().min(1).trim(),
  next_follow_up_date: z.string().datetime(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;

import { z } from "zod";

export const updateStatusSchema = z.object({
  status: z.enum([
    "NEW_LEAD",
    "CONTACTED",
    "IN_DISCUSSION",
    "PITCHING",
    "NEGOTIATION",
    "ON_HOLD",
    "DEAL",
    "LOST",
  ]),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

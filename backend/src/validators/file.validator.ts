import { z } from "zod";

export const evidenceFileSchema = z.object({
  mimetype: z.enum(["image/jpeg", "image/png"]),
  size: z.number().max(5 * 1024 * 1024),
});

export type EvidenceFileInput = z.infer<typeof evidenceFileSchema>;

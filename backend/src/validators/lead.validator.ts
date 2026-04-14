import { z } from "zod";

const pipelineStatuses = [
  "NEW_LEAD",
  "CONTACTED",
  "IN_DISCUSSION",
  "PITCHING",
  "NEGOTIATION",
  "ON_HOLD",
  "DEAL",
  "LOST",
] as const;

export const createLeadSchema = z.object({
  nama_eo: z.string().min(1).max(255).trim(),
  tipe_id: z.string().uuid(),
  alamat: z.string().min(1).max(500).trim(),
  speciality: z.string().max(255).optional(),
  link_sosmed: z.string().url().optional().or(z.literal("")),
});

export const updateLeadSchema = createLeadSchema.partial();

export const leadFilterSchema = z.object({
  status: z.enum(pipelineStatuses).optional(),
  pic_id: z.string().uuid().optional(),
  tipe_id: z.string().uuid().optional(),
  last_activity_from: z.string().datetime().optional(),
  last_activity_to: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFilterInput = z.infer<typeof leadFilterSchema>;

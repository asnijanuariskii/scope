import { z } from "zod";

export const createContactSchema = z.object({
  nama: z.string().min(1).max(255).trim(),
  no_telp: z.string().min(1).max(20).trim(),
  jabatan: z.string().min(1).max(100).trim(),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

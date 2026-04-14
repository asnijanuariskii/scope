import { z } from "zod";

export const createUserSchema = z.object({
  nama: z.string().min(1).max(255).trim(),
  employee_id: z.string().min(1).max(50).trim(),
  phone_number: z.string().min(1).max(20).trim(),
  role: z.enum(["SUPERADMIN", "SUPERIOR", "PIC"]),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

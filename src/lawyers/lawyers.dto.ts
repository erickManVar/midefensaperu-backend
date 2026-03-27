import { z } from 'zod';

export const CreateLawyerProfileSchema = z.object({
  colegiatura: z.string().min(3, 'Número de colegiatura requerido'),
  especialidades: z.array(z.string()).min(1, 'Al menos una especialidad requerida'),
  precio: z.number().positive('El precio debe ser positivo'),
  descripcion: z.string().optional(),
  aniosExperiencia: z.number().int().min(0),
  distrito: z.string().optional(),
  ciudad: z.string().default('Lima'),
  fotoUrl: z.string().url().optional(),
});

export type CreateLawyerProfileDto = z.infer<typeof CreateLawyerProfileSchema>;

export const UpdateLawyerProfileSchema = CreateLawyerProfileSchema.partial();
export type UpdateLawyerProfileDto = z.infer<typeof UpdateLawyerProfileSchema>;

export const SearchLawyersSchema = z.object({
  especialidad: z.string().optional(),
  ciudad: z.string().optional(),
  distrito: z.string().optional(),
  precioMin: z.coerce.number().optional(),
  precioMax: z.coerce.number().optional(),
  ratingMin: z.coerce.number().min(1).max(5).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type SearchLawyersDto = z.infer<typeof SearchLawyersSchema>;

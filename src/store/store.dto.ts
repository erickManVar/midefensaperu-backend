import { z } from 'zod';

export const CreateProductSchema = z.object({
  nombre: z.string().min(3).max(200),
  descripcion: z.string().max(2000).optional(),
  precio: z.number().positive(),
  categoria: z.string().min(1),
  stock: z.number().int().min(0),
  imagen: z.string().url().optional(),
});

export const UpdateProductSchema = z.object({
  nombre: z.string().min(3).max(200).optional(),
  descripcion: z.string().max(2000).optional(),
  precio: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  imagen: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export const BuyProductSchema = z.object({
  cantidad: z.number().int().positive(),
  culqiToken: z.string().min(1),
  email: z.string().email(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export type BuyProductDto = z.infer<typeof BuyProductSchema>;

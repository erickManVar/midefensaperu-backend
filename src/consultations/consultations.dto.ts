import { z } from 'zod';

export const CreateConsultationSchema = z.object({
  lawyerId: z.string().uuid('ID de abogado inválido'),
  descripcion: z.string().min(10, 'Descripción mínimo 10 caracteres').optional(),
});

export type CreateConsultationDto = z.infer<typeof CreateConsultationSchema>;

export const PayConsultationSchema = z.object({
  culqiToken: z.string().min(1, 'Token de pago requerido'),
  email: z.string().email('Email inválido'),
});

export type PayConsultationDto = z.infer<typeof PayConsultationSchema>;

export const DisputeConsultationSchema = z.object({
  reason: z.string().min(20, 'Describe el motivo de la disputa (mínimo 20 caracteres)'),
});

export type DisputeConsultationDto = z.infer<typeof DisputeConsultationSchema>;

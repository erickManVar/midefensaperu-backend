import { z } from 'zod';
export declare const CreateConsultationSchema: z.ZodObject<{
    lawyerId: z.ZodString;
    descripcion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    lawyerId: string;
    descripcion?: string | undefined;
}, {
    lawyerId: string;
    descripcion?: string | undefined;
}>;
export type CreateConsultationDto = z.infer<typeof CreateConsultationSchema>;
export declare const PayConsultationSchema: z.ZodObject<{
    culqiToken: z.ZodString;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    culqiToken: string;
}, {
    email: string;
    culqiToken: string;
}>;
export type PayConsultationDto = z.infer<typeof PayConsultationSchema>;
export declare const DisputeConsultationSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
export type DisputeConsultationDto = z.infer<typeof DisputeConsultationSchema>;

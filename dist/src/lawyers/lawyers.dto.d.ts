import { z } from 'zod';
export declare const CreateLawyerProfileSchema: z.ZodObject<{
    colegiatura: z.ZodString;
    especialidades: z.ZodArray<z.ZodString, "many">;
    precio: z.ZodNumber;
    descripcion: z.ZodOptional<z.ZodString>;
    aniosExperiencia: z.ZodNumber;
    distrito: z.ZodOptional<z.ZodString>;
    ciudad: z.ZodDefault<z.ZodString>;
    fotoUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    colegiatura: string;
    especialidades: string[];
    precio: number;
    aniosExperiencia: number;
    ciudad: string;
    descripcion?: string | undefined;
    distrito?: string | undefined;
    fotoUrl?: string | undefined;
}, {
    colegiatura: string;
    especialidades: string[];
    precio: number;
    aniosExperiencia: number;
    descripcion?: string | undefined;
    distrito?: string | undefined;
    ciudad?: string | undefined;
    fotoUrl?: string | undefined;
}>;
export type CreateLawyerProfileDto = z.infer<typeof CreateLawyerProfileSchema>;
export declare const UpdateLawyerProfileSchema: z.ZodObject<{
    colegiatura: z.ZodOptional<z.ZodString>;
    especialidades: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    precio: z.ZodOptional<z.ZodNumber>;
    descripcion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    aniosExperiencia: z.ZodOptional<z.ZodNumber>;
    distrito: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    ciudad: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    fotoUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    colegiatura?: string | undefined;
    especialidades?: string[] | undefined;
    precio?: number | undefined;
    descripcion?: string | undefined;
    aniosExperiencia?: number | undefined;
    distrito?: string | undefined;
    ciudad?: string | undefined;
    fotoUrl?: string | undefined;
}, {
    colegiatura?: string | undefined;
    especialidades?: string[] | undefined;
    precio?: number | undefined;
    descripcion?: string | undefined;
    aniosExperiencia?: number | undefined;
    distrito?: string | undefined;
    ciudad?: string | undefined;
    fotoUrl?: string | undefined;
}>;
export type UpdateLawyerProfileDto = z.infer<typeof UpdateLawyerProfileSchema>;
export declare const SearchLawyersSchema: z.ZodObject<{
    especialidad: z.ZodOptional<z.ZodString>;
    ciudad: z.ZodOptional<z.ZodString>;
    distrito: z.ZodOptional<z.ZodString>;
    precioMin: z.ZodOptional<z.ZodNumber>;
    precioMax: z.ZodOptional<z.ZodNumber>;
    ratingMin: z.ZodOptional<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    distrito?: string | undefined;
    ciudad?: string | undefined;
    especialidad?: string | undefined;
    precioMin?: number | undefined;
    precioMax?: number | undefined;
    ratingMin?: number | undefined;
    cursor?: string | undefined;
}, {
    distrito?: string | undefined;
    ciudad?: string | undefined;
    limit?: number | undefined;
    especialidad?: string | undefined;
    precioMin?: number | undefined;
    precioMax?: number | undefined;
    ratingMin?: number | undefined;
    cursor?: string | undefined;
}>;
export type SearchLawyersDto = z.infer<typeof SearchLawyersSchema>;

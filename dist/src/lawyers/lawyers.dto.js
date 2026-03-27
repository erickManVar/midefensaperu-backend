"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchLawyersSchema = exports.UpdateLawyerProfileSchema = exports.CreateLawyerProfileSchema = void 0;
const zod_1 = require("zod");
exports.CreateLawyerProfileSchema = zod_1.z.object({
    colegiatura: zod_1.z.string().min(3, 'Número de colegiatura requerido'),
    especialidades: zod_1.z.array(zod_1.z.string()).min(1, 'Al menos una especialidad requerida'),
    precio: zod_1.z.number().positive('El precio debe ser positivo'),
    descripcion: zod_1.z.string().optional(),
    aniosExperiencia: zod_1.z.number().int().min(0),
    distrito: zod_1.z.string().optional(),
    ciudad: zod_1.z.string().default('Lima'),
    fotoUrl: zod_1.z.string().url().optional(),
});
exports.UpdateLawyerProfileSchema = exports.CreateLawyerProfileSchema.partial();
exports.SearchLawyersSchema = zod_1.z.object({
    especialidad: zod_1.z.string().optional(),
    ciudad: zod_1.z.string().optional(),
    distrito: zod_1.z.string().optional(),
    precioMin: zod_1.z.coerce.number().optional(),
    precioMax: zod_1.z.coerce.number().optional(),
    ratingMin: zod_1.z.coerce.number().min(1).max(5).optional(),
    cursor: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(10),
});
//# sourceMappingURL=lawyers.dto.js.map
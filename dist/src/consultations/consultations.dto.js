"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeConsultationSchema = exports.PayConsultationSchema = exports.CreateConsultationSchema = void 0;
const zod_1 = require("zod");
exports.CreateConsultationSchema = zod_1.z.object({
    lawyerId: zod_1.z.string().uuid('ID de abogado inválido'),
    descripcion: zod_1.z.string().min(10, 'Descripción mínimo 10 caracteres').optional(),
});
exports.PayConsultationSchema = zod_1.z.object({
    culqiToken: zod_1.z.string().min(1, 'Token de pago requerido'),
    email: zod_1.z.string().email('Email inválido'),
});
exports.DisputeConsultationSchema = zod_1.z.object({
    reason: zod_1.z.string().min(20, 'Describe el motivo de la disputa (mínimo 20 caracteres)'),
});
//# sourceMappingURL=consultations.dto.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(8, 'Contraseña mínimo 8 caracteres'),
    firstName: zod_1.z.string().min(2, 'Nombre requerido'),
    lastName: zod_1.z.string().min(2, 'Apellido requerido'),
    role: zod_1.z.enum(['CLIENT', 'LAWYER', 'PROVIDER']).default('CLIENT'),
    phone: zod_1.z.string().optional(),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(1, 'Contraseña requerida'),
});
exports.ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8, 'Nueva contraseña mínimo 8 caracteres'),
});
//# sourceMappingURL=auth.dto.js.map
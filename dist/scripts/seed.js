"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const neon_http_1 = require("drizzle-orm/neon-http");
const serverless_1 = require("@neondatabase/serverless");
const schema = __importStar(require("../src/database/schema"));
const jwt_util_1 = require("../src/common/utils/jwt.util");
async function seed() {
    const sql = (0, serverless_1.neon)(process.env.DATABASE_URL);
    const db = (0, neon_http_1.drizzle)(sql, { schema });
    console.log('Seeding database...');
    const adminHash = (0, jwt_util_1.hashPassword)('Admin123!');
    const [admin] = await db.insert(schema.users).values({ email: 'admin@midefensaperu.com', passwordHash: adminHash, role: 'ADMIN', firstName: 'Admin', lastName: 'MDP' }).returning().onConflictDoNothing();
    console.log('Admin created:', admin?.email);
    const clientHash = (0, jwt_util_1.hashPassword)('Client123!');
    const [client] = await db.insert(schema.users).values({ email: 'cliente@test.com', passwordHash: clientHash, role: 'CLIENT', firstName: 'Juan', lastName: 'García' }).returning().onConflictDoNothing();
    console.log('Client created:', client?.email);
    const lawyerHash = (0, jwt_util_1.hashPassword)('Lawyer123!');
    const [lawyer] = await db.insert(schema.users).values({ email: 'abogado@test.com', passwordHash: lawyerHash, role: 'LAWYER', firstName: 'María', lastName: 'López' }).returning().onConflictDoNothing();
    if (lawyer) {
        const [lp] = await db.insert(schema.lawyerProfiles).values({ userId: lawyer.id, colegiatura: 'CAL-12345', especialidades: ['Derecho Civil', 'Derecho Laboral'], precio: '150.00', descripcion: 'Abogada con 10 años de experiencia en derecho civil y laboral', aniosExperiencia: 10, ciudad: 'Lima', distrito: 'Miraflores', estado: 'VERIFIED' }).returning().onConflictDoNothing();
        console.log('Lawyer profile created:', lp?.colegiatura);
    }
    const providerHash = (0, jwt_util_1.hashPassword)('Provider123!');
    const [provider] = await db.insert(schema.users).values({ email: 'proveedor@test.com', passwordHash: providerHash, role: 'PROVIDER', firstName: 'Carlos', lastName: 'Vendedor' }).returning().onConflictDoNothing();
    if (provider) {
        await db.insert(schema.products).values([
            { providerId: provider.id, nombre: 'Manual de Derecho Civil Peruano', descripcion: 'Libro esencial para abogados', precio: '89.90', categoria: 'LIBROS', stock: 50 },
            { providerId: provider.id, nombre: 'Toga de Abogado Premium', descripcion: 'Toga de alta calidad', precio: '299.00', categoria: 'ROPA', stock: 20 },
        ]).onConflictDoNothing();
        console.log('Products created');
    }
    console.log('\nSeed completed!\nCredentials:');
    console.log('Admin: admin@midefensaperu.com / Admin123!');
    console.log('Client: cliente@test.com / Client123!');
    console.log('Lawyer: abogado@test.com / Lawyer123!');
    console.log('Provider: proveedor@test.com / Provider123!');
    process.exit(0);
}
seed().catch((e) => { console.error(e); process.exit(1); });
//# sourceMappingURL=seed.js.map
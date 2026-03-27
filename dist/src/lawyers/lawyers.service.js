"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawyersService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../database/database.module");
const schema_1 = require("../database/schema");
const node_cache_1 = __importDefault(require("node-cache"));
const pagination_util_1 = require("../common/utils/pagination.util");
const lawyerCache = new node_cache_1.default({ stdTTL: 300, checkperiod: 60 });
let LawyersService = class LawyersService {
    constructor(db) {
        this.db = db;
    }
    async createProfile(userId, dto) {
        const existing = await this.db
            .select()
            .from(schema_1.lawyerProfiles)
            .where((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.userId, userId))
            .limit(1);
        if (existing.length > 0) {
            throw new common_1.ConflictException('Ya tienes un perfil de abogado');
        }
        const colegiaturaExists = await this.db
            .select()
            .from(schema_1.lawyerProfiles)
            .where((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.colegiatura, dto.colegiatura))
            .limit(1);
        if (colegiaturaExists.length > 0) {
            throw new common_1.ConflictException('Número de colegiatura ya registrado');
        }
        const [profile] = await this.db
            .insert(schema_1.lawyerProfiles)
            .values({
            userId,
            colegiatura: dto.colegiatura,
            especialidades: dto.especialidades,
            precio: dto.precio.toString(),
            descripcion: dto.descripcion,
            aniosExperiencia: dto.aniosExperiencia,
            distrito: dto.distrito,
            ciudad: dto.ciudad,
            fotoUrl: dto.fotoUrl,
        })
            .returning();
        lawyerCache.del(`lawyer:${userId}`);
        return profile;
    }
    async getProfile(userId) {
        const cacheKey = `lawyer:${userId}`;
        const cached = lawyerCache.get(cacheKey);
        if (cached)
            return cached;
        const [profile] = await this.db
            .select()
            .from(schema_1.lawyerProfiles)
            .where((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.userId, userId))
            .limit(1);
        if (!profile) {
            throw new common_1.NotFoundException('Perfil de abogado no encontrado');
        }
        lawyerCache.set(cacheKey, profile);
        return profile;
    }
    async getProfileById(lawyerProfileId) {
        const cacheKey = `lawyer-id:${lawyerProfileId}`;
        const cached = lawyerCache.get(cacheKey);
        if (cached)
            return cached;
        const [profile] = await this.db
            .select({
            id: schema_1.lawyerProfiles.id,
            userId: schema_1.lawyerProfiles.userId,
            colegiatura: schema_1.lawyerProfiles.colegiatura,
            especialidades: schema_1.lawyerProfiles.especialidades,
            precio: schema_1.lawyerProfiles.precio,
            descripcion: schema_1.lawyerProfiles.descripcion,
            aniosExperiencia: schema_1.lawyerProfiles.aniosExperiencia,
            distrito: schema_1.lawyerProfiles.distrito,
            ciudad: schema_1.lawyerProfiles.ciudad,
            estado: schema_1.lawyerProfiles.estado,
            rating: schema_1.lawyerProfiles.rating,
            totalCases: schema_1.lawyerProfiles.totalCases,
            totalReviews: schema_1.lawyerProfiles.totalReviews,
            fotoUrl: schema_1.lawyerProfiles.fotoUrl,
            firstName: schema_1.users.firstName,
            lastName: schema_1.users.lastName,
            email: schema_1.users.email,
        })
            .from(schema_1.lawyerProfiles)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.id, lawyerProfileId))
            .limit(1);
        if (!profile) {
            throw new common_1.NotFoundException('Abogado no encontrado');
        }
        lawyerCache.set(cacheKey, profile);
        return profile;
    }
    async updateProfile(userId, dto) {
        const [existing] = await this.db
            .select()
            .from(schema_1.lawyerProfiles)
            .where((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.userId, userId))
            .limit(1);
        if (!existing) {
            throw new common_1.NotFoundException('Perfil de abogado no encontrado');
        }
        const updateData = {
            updatedAt: new Date(),
        };
        if (dto.especialidades)
            updateData.especialidades = dto.especialidades;
        if (dto.precio !== undefined)
            updateData.precio = dto.precio.toString();
        if (dto.descripcion !== undefined)
            updateData.descripcion = dto.descripcion;
        if (dto.aniosExperiencia !== undefined)
            updateData.aniosExperiencia = dto.aniosExperiencia;
        if (dto.distrito !== undefined)
            updateData.distrito = dto.distrito;
        if (dto.ciudad !== undefined)
            updateData.ciudad = dto.ciudad;
        if (dto.fotoUrl !== undefined)
            updateData.fotoUrl = dto.fotoUrl;
        const [updated] = await this.db
            .update(schema_1.lawyerProfiles)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.userId, userId))
            .returning();
        lawyerCache.del(`lawyer:${userId}`);
        lawyerCache.del(`lawyer-id:${existing.id}`);
        return updated;
    }
    async searchLawyers(dto) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.estado, 'VERIFIED')];
        if (dto.ciudad) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.ciudad, dto.ciudad));
        }
        if (dto.precioMin !== undefined) {
            conditions.push((0, drizzle_orm_1.gte)(schema_1.lawyerProfiles.precio, dto.precioMin.toString()));
        }
        if (dto.precioMax !== undefined) {
            conditions.push((0, drizzle_orm_1.lte)(schema_1.lawyerProfiles.precio, dto.precioMax.toString()));
        }
        if (dto.ratingMin !== undefined) {
            conditions.push((0, drizzle_orm_1.gte)(schema_1.lawyerProfiles.rating, dto.ratingMin.toString()));
        }
        if (dto.cursor) {
            const cursorId = (0, pagination_util_1.decodeCursor)(dto.cursor);
            conditions.push((0, drizzle_orm_1.gt)(schema_1.lawyerProfiles.id, cursorId));
        }
        const limit = dto.limit + 1;
        let query = this.db
            .select({
            id: schema_1.lawyerProfiles.id,
            userId: schema_1.lawyerProfiles.userId,
            colegiatura: schema_1.lawyerProfiles.colegiatura,
            especialidades: schema_1.lawyerProfiles.especialidades,
            precio: schema_1.lawyerProfiles.precio,
            descripcion: schema_1.lawyerProfiles.descripcion,
            aniosExperiencia: schema_1.lawyerProfiles.aniosExperiencia,
            distrito: schema_1.lawyerProfiles.distrito,
            ciudad: schema_1.lawyerProfiles.ciudad,
            estado: schema_1.lawyerProfiles.estado,
            rating: schema_1.lawyerProfiles.rating,
            totalCases: schema_1.lawyerProfiles.totalCases,
            fotoUrl: schema_1.lawyerProfiles.fotoUrl,
            firstName: schema_1.users.firstName,
            lastName: schema_1.users.lastName,
        })
            .from(schema_1.lawyerProfiles)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.and)(...conditions))
            .limit(limit)
            .$dynamic();
        if (dto.especialidad) {
            query = query.where((0, drizzle_orm_1.sql) `${schema_1.lawyerProfiles.especialidades} @> ${JSON.stringify([dto.especialidad])}::jsonb`);
        }
        const results = await query;
        const hasMore = results.length > dto.limit;
        const data = hasMore ? results.slice(0, dto.limit) : results;
        const nextCursor = hasMore && data.length > 0 ? (0, pagination_util_1.encodeCursor)(data[data.length - 1].id) : null;
        return {
            data,
            nextCursor,
            hasMore,
        };
    }
    async verifyLawyer(lawyerProfileId) {
        const [profile] = await this.db
            .update(schema_1.lawyerProfiles)
            .set({ estado: 'VERIFIED', updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.id, lawyerProfileId))
            .returning();
        if (!profile) {
            throw new common_1.NotFoundException('Perfil de abogado no encontrado');
        }
        lawyerCache.del(`lawyer-id:${lawyerProfileId}`);
        lawyerCache.del(`lawyer:${profile.userId}`);
        return profile;
    }
    async suspendLawyer(lawyerProfileId) {
        const [profile] = await this.db
            .update(schema_1.lawyerProfiles)
            .set({ estado: 'SUSPENDED', updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.id, lawyerProfileId))
            .returning();
        if (!profile) {
            throw new common_1.NotFoundException('Perfil de abogado no encontrado');
        }
        lawyerCache.del(`lawyer-id:${lawyerProfileId}`);
        lawyerCache.del(`lawyer:${profile.userId}`);
        return profile;
    }
    async getPendingVerification() {
        return this.db
            .select({
            id: schema_1.lawyerProfiles.id,
            userId: schema_1.lawyerProfiles.userId,
            colegiatura: schema_1.lawyerProfiles.colegiatura,
            especialidades: schema_1.lawyerProfiles.especialidades,
            precio: schema_1.lawyerProfiles.precio,
            ciudad: schema_1.lawyerProfiles.ciudad,
            createdAt: schema_1.lawyerProfiles.createdAt,
            firstName: schema_1.users.firstName,
            lastName: schema_1.users.lastName,
            email: schema_1.users.email,
        })
            .from(schema_1.lawyerProfiles)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.estado, 'PENDING_VERIFICATION'));
    }
    invalidateCache(userId, profileId) {
        lawyerCache.del(`lawyer:${userId}`);
        if (profileId)
            lawyerCache.del(`lawyer-id:${profileId}`);
    }
};
exports.LawyersService = LawyersService;
exports.LawyersService = LawyersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_TOKEN)),
    __metadata("design:paramtypes", [Object])
], LawyersService);
//# sourceMappingURL=lawyers.service.js.map
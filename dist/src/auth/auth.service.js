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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../database/database.module");
const schema_1 = require("../database/schema");
const jwt_util_1 = require("../common/utils/jwt.util");
let AuthService = class AuthService {
    constructor(db, configService) {
        this.db = db;
        this.configService = configService;
    }
    async register(dto) {
        const existing = await this.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, dto.email))
            .limit(1);
        if (existing.length > 0) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const passwordHash = (0, jwt_util_1.hashPassword)(dto.password);
        const [user] = await this.db
            .insert(schema_1.users)
            .values({
            email: dto.email,
            passwordHash,
            role: dto.role,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
        })
            .returning({
            id: schema_1.users.id,
            email: schema_1.users.email,
            role: schema_1.users.role,
            firstName: schema_1.users.firstName,
            lastName: schema_1.users.lastName,
        });
        const token = this.generateToken(user.id, user.email, user.role);
        return {
            user,
            token,
        };
    }
    async login(dto) {
        const [user] = await this.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, dto.email))
            .limit(1);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Cuenta suspendida');
        }
        if (!(0, jwt_util_1.verifyPassword)(dto.password, user.passwordHash)) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const token = this.generateToken(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            token,
        };
    }
    async getProfile(userId) {
        const [user] = await this.db
            .select({
            id: schema_1.users.id,
            email: schema_1.users.email,
            role: schema_1.users.role,
            firstName: schema_1.users.firstName,
            lastName: schema_1.users.lastName,
            phone: schema_1.users.phone,
            avatarUrl: schema_1.users.avatarUrl,
            emailVerified: schema_1.users.emailVerified,
            createdAt: schema_1.users.createdAt,
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId))
            .limit(1);
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        return user;
    }
    generateToken(userId, email, role) {
        const secret = this.configService.get('JWT_SECRET') ?? 'fallback-secret';
        return (0, jwt_util_1.signJwt)({ sub: userId, email, role }, secret, 86400 * 7);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_TOKEN)),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
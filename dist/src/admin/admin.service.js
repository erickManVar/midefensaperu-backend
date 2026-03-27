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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../database/database.module");
const schema_1 = require("../database/schema");
const lawyers_service_1 = require("../lawyers/lawyers.service");
const notifications_service_1 = require("../notifications/notifications.service");
let AdminService = class AdminService {
    constructor(db, lawyersService, notificationsService) {
        this.db = db;
        this.lawyersService = lawyersService;
        this.notificationsService = notificationsService;
    }
    async getPendingLawyers() { return this.lawyersService.getPendingVerification(); }
    async verifyLawyer(lawyerProfileId) {
        const profile = await this.lawyersService.verifyLawyer(lawyerProfileId);
        const [user] = await this.db.select({ email: schema_1.users.email, firstName: schema_1.users.firstName }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, profile.userId)).limit(1);
        if (user?.email)
            void this.notificationsService.notifyLawyerVerified(user.email, user.firstName ?? 'Abogado');
        return profile;
    }
    async suspendLawyer(lawyerProfileId) { return this.lawyersService.suspendLawyer(lawyerProfileId); }
    async getBypassAttempts() { return this.db.select().from(schema_1.bypassAttempts); }
    async getDisputedConsultations() { return this.db.select().from(schema_1.consultations).where((0, drizzle_orm_1.eq)(schema_1.consultations.estado, 'DISPUTED')); }
    async resolveDispute(consultationId, favor) {
        const [consultation] = await this.db.select().from(schema_1.consultations).where((0, drizzle_orm_1.eq)(schema_1.consultations.id, consultationId)).limit(1);
        if (!consultation)
            throw new Error('Consulta no encontrada');
        await this.db.update(schema_1.consultations).set({ estado: favor === 'CLIENT' ? 'CANCELLED' : 'COMPLETED', updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.consultations.id, consultationId));
        return { success: true, favor };
    }
    async getStats() {
        const [totalUsers] = await this.db.select().from(schema_1.users);
        return { message: 'Stats endpoint - to be expanded' };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_TOKEN)),
    __metadata("design:paramtypes", [Object, lawyers_service_1.LawyersService, notifications_service_1.NotificationsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map
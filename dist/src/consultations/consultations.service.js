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
exports.ConsultationsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../database/database.module");
const schema_1 = require("../database/schema");
const payments_service_1 = require("../payments/payments.service");
const notifications_service_1 = require("../notifications/notifications.service");
const config_1 = require("@nestjs/config");
let ConsultationsService = class ConsultationsService {
    constructor(db, paymentsService, notificationsService, configService) {
        this.db = db;
        this.paymentsService = paymentsService;
        this.notificationsService = notificationsService;
        this.configService = configService;
        this.commissionPercent = Number(this.configService.get('PLATFORM_COMMISSION_PERCENT') ?? '20');
        this.autoReleaseDays = Number(this.configService.get('ESCROW_AUTO_RELEASE_DAYS') ?? '7');
    }
    async createConsultation(clientId, dto) {
        const [lawyerProfile] = await this.db
            .select()
            .from(schema_1.lawyerProfiles)
            .where((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.userId, dto.lawyerId))
            .limit(1);
        if (!lawyerProfile) {
            throw new common_1.NotFoundException('Abogado no encontrado');
        }
        if (lawyerProfile.estado !== 'VERIFIED') {
            throw new common_1.BadRequestException('El abogado no está verificado');
        }
        if (clientId === dto.lawyerId) {
            throw new common_1.BadRequestException('No puedes contratarte a ti mismo');
        }
        const autoReleaseAt = new Date();
        autoReleaseAt.setDate(autoReleaseAt.getDate() + this.autoReleaseDays);
        const [consultation] = await this.db
            .insert(schema_1.consultations)
            .values({
            clientId,
            lawyerId: dto.lawyerId,
            monto: lawyerProfile.precio,
            estado: 'PENDING_PAYMENT',
            descripcion: dto.descripcion,
            autoReleaseAt,
        })
            .returning();
        return consultation;
    }
    async payConsultation(consultationId, clientId, dto) {
        const [consultation] = await this.db
            .select()
            .from(schema_1.consultations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.consultations.id, consultationId), (0, drizzle_orm_1.eq)(schema_1.consultations.clientId, clientId)))
            .limit(1);
        if (!consultation) {
            throw new common_1.NotFoundException('Consulta no encontrada');
        }
        if (consultation.estado !== 'PENDING_PAYMENT') {
            throw new common_1.BadRequestException('Esta consulta ya fue pagada o está en otro estado');
        }
        const amount = parseFloat(consultation.monto);
        const amountCentimos = this.paymentsService.solesACentimos(amount);
        const charge = await this.paymentsService.createCharge({
            amount: amountCentimos,
            currencyCode: 'PEN',
            email: dto.email,
            sourceId: dto.culqiToken,
            description: `Consulta legal MiDefensaPeru - ${consultationId}`,
            metadata: { consultationId, clientId },
        });
        const commissionAmount = (amount * this.commissionPercent) / 100;
        await this.db
            .update(schema_1.consultations)
            .set({
            estado: 'HELD',
            escrowId: `escrow_${consultationId}`,
            culqiChargeId: charge.id,
            comision: commissionAmount.toFixed(2),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.consultations.id, consultationId));
        const [lawyerUser] = await this.db
            .select({ email: schema_1.users.email, firstName: schema_1.users.firstName })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, consultation.lawyerId))
            .limit(1);
        if (lawyerUser?.email) {
            void this.notificationsService.notifyPaymentReceived(lawyerUser.email, lawyerUser.firstName ?? 'Abogado', amount.toFixed(2));
        }
        return { success: true, chargeId: charge.id };
    }
    async confirmConsultation(consultationId, clientId) {
        const [consultation] = await this.db
            .select()
            .from(schema_1.consultations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.consultations.id, consultationId), (0, drizzle_orm_1.eq)(schema_1.consultations.clientId, clientId)))
            .limit(1);
        if (!consultation) {
            throw new common_1.NotFoundException('Consulta no encontrada');
        }
        if (!['HELD', 'IN_PROGRESS'].includes(consultation.estado)) {
            throw new common_1.BadRequestException('Esta consulta no puede ser confirmada en su estado actual');
        }
        const monto = parseFloat(consultation.monto);
        const comision = parseFloat(consultation.comision ?? '0');
        const montoAbogado = (monto - comision).toFixed(2);
        await this.db
            .update(schema_1.consultations)
            .set({
            estado: 'COMPLETED',
            completedAt: new Date(),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.consultations.id, consultationId));
        await this.db
            .update(schema_1.lawyerProfiles)
            .set({
            totalCases: schema_1.lawyerProfiles.totalCases,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.userId, consultation.lawyerId));
        const [lawyerUser] = await this.db
            .select({ email: schema_1.users.email })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, consultation.lawyerId))
            .limit(1);
        if (lawyerUser?.email) {
            void this.notificationsService.notifyConsultationConfirmed(lawyerUser.email, montoAbogado, comision.toFixed(2));
        }
        return { success: true, montoLiberado: montoAbogado, comision: comision.toFixed(2) };
    }
    async disputeConsultation(consultationId, clientId, dto) {
        const [consultation] = await this.db
            .select()
            .from(schema_1.consultations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.consultations.id, consultationId), (0, drizzle_orm_1.eq)(schema_1.consultations.clientId, clientId)))
            .limit(1);
        if (!consultation) {
            throw new common_1.NotFoundException('Consulta no encontrada');
        }
        if (!['HELD', 'IN_PROGRESS'].includes(consultation.estado)) {
            throw new common_1.BadRequestException('No se puede disputar esta consulta en su estado actual');
        }
        await this.db
            .update(schema_1.consultations)
            .set({
            estado: 'DISPUTED',
            disputeReason: dto.reason,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.consultations.id, consultationId));
        return { success: true, message: 'Disputa registrada. El equipo de MiDefensaPeru revisará el caso.' };
    }
    async getClientConsultations(clientId) {
        return this.db
            .select()
            .from(schema_1.consultations)
            .where((0, drizzle_orm_1.eq)(schema_1.consultations.clientId, clientId));
    }
    async getLawyerConsultations(lawyerId) {
        return this.db
            .select()
            .from(schema_1.consultations)
            .where((0, drizzle_orm_1.eq)(schema_1.consultations.lawyerId, lawyerId));
    }
    async getConsultation(consultationId, userId) {
        const [consultation] = await this.db
            .select()
            .from(schema_1.consultations)
            .where((0, drizzle_orm_1.eq)(schema_1.consultations.id, consultationId))
            .limit(1);
        if (!consultation) {
            throw new common_1.NotFoundException('Consulta no encontrada');
        }
        if (consultation.clientId !== userId && consultation.lawyerId !== userId) {
            throw new common_1.ForbiddenException('No tienes acceso a esta consulta');
        }
        return consultation;
    }
    async processAutoReleases() {
        const now = new Date();
        const toRelease = await this.db
            .select()
            .from(schema_1.consultations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.consultations.estado, 'HELD')));
        for (const consultation of toRelease) {
            if (consultation.autoReleaseAt && consultation.autoReleaseAt <= now) {
                const monto = parseFloat(consultation.monto);
                const comision = (monto * this.commissionPercent) / 100;
                await this.db
                    .update(schema_1.consultations)
                    .set({
                    estado: 'RELEASED',
                    comision: comision.toFixed(2),
                    completedAt: now,
                    updatedAt: now,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.consultations.id, consultation.id));
            }
        }
    }
};
exports.ConsultationsService = ConsultationsService;
exports.ConsultationsService = ConsultationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_TOKEN)),
    __metadata("design:paramtypes", [Object, payments_service_1.PaymentsService,
        notifications_service_1.NotificationsService,
        config_1.ConfigService])
], ConsultationsService);
//# sourceMappingURL=consultations.service.js.map
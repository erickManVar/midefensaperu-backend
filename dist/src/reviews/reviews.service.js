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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../database/database.module");
const schema_1 = require("../database/schema");
const notifications_service_1 = require("../notifications/notifications.service");
let ReviewsService = class ReviewsService {
    constructor(db, notificationsService) {
        this.db = db;
        this.notificationsService = notificationsService;
    }
    async createReview(clientId, dto) {
        const [consultation] = await this.db.select().from(schema_1.consultations).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.consultations.id, dto.consultationId), (0, drizzle_orm_1.eq)(schema_1.consultations.clientId, clientId))).limit(1);
        if (!consultation)
            throw new common_1.NotFoundException('Consulta no encontrada');
        if (consultation.estado !== 'COMPLETED')
            throw new common_1.BadRequestException('Solo puedes reseñar consultas completadas');
        const existing = await this.db.select().from(schema_1.reviews).where((0, drizzle_orm_1.eq)(schema_1.reviews.consultationId, dto.consultationId)).limit(1);
        if (existing.length > 0)
            throw new common_1.ConflictException('Ya has dejado una reseña para esta consulta');
        if (dto.rating < 1 || dto.rating > 5)
            throw new common_1.BadRequestException('Rating debe ser entre 1 y 5');
        const [review] = await this.db.insert(schema_1.reviews).values({ consultationId: dto.consultationId, clientId, lawyerId: consultation.lawyerId, rating: dto.rating, comentario: dto.comentario }).returning();
        const allReviews = await this.db.select({ rating: schema_1.reviews.rating }).from(schema_1.reviews).where((0, drizzle_orm_1.eq)(schema_1.reviews.lawyerId, consultation.lawyerId));
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await this.db.update(schema_1.lawyerProfiles).set({ rating: avgRating.toFixed(2), totalReviews: allReviews.length, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.userId, consultation.lawyerId));
        const [lawyerUser] = await this.db.select({ email: schema_1.users.email }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, consultation.lawyerId)).limit(1);
        if (lawyerUser?.email)
            void this.notificationsService.notifyNewReview(lawyerUser.email, dto.rating, dto.comentario);
        return review;
    }
    async updateReview(reviewId, clientId, dto) {
        const [review] = await this.db.select().from(schema_1.reviews).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.reviews.id, reviewId), (0, drizzle_orm_1.eq)(schema_1.reviews.clientId, clientId))).limit(1);
        if (!review)
            throw new common_1.NotFoundException('Reseña no encontrada');
        const hoursSince = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursSince > 24)
            throw new common_1.BadRequestException('No puedes editar una reseña después de 24 horas');
        const [updated] = await this.db.update(schema_1.reviews).set({ rating: dto.rating ?? review.rating, comentario: dto.comentario ?? review.comentario, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.reviews.id, reviewId)).returning();
        return updated;
    }
    async getLawyerReviews(lawyerId) {
        return this.db.select().from(schema_1.reviews).where((0, drizzle_orm_1.eq)(schema_1.reviews.lawyerId, lawyerId));
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_TOKEN)),
    __metadata("design:paramtypes", [Object, notifications_service_1.NotificationsService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map
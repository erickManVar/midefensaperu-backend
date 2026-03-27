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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../database/database.module");
const schema_1 = require("../database/schema");
const notifications_service_1 = require("../notifications/notifications.service");
const CONTACT_PATTERNS = [
    { regex: /(\+?[\d\s\-()]{7,})/g, type: 'phone' },
    { regex: /[\w.-]+@[\w.-]+\.\w{2,}/g, type: 'email' },
    { regex: /(https?:\/\/)?(wa\.me|whatsapp\.com)\S*/gi, type: 'whatsapp' },
    { regex: /(https?:\/\/)?(instagram\.com|t\.me|facebook\.com|twitter\.com|tiktok\.com)\S*/gi, type: 'social' },
    { regex: /@[\w.]+/g, type: 'social_handle' },
];
const BLOCKED_MESSAGE = '[Contacto externo bloqueado. Usa la plataforma para comunicarte]';
let ChatService = class ChatService {
    constructor(db, notificationsService) {
        this.db = db;
        this.notificationsService = notificationsService;
    }
    detectAndBlock(content) {
        let blocked = false;
        let detectedType;
        for (const pattern of CONTACT_PATTERNS) {
            const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
            if (regex.test(content)) {
                blocked = true;
                detectedType = pattern.type;
                break;
            }
        }
        return { blocked, sanitized: blocked ? BLOCKED_MESSAGE : content, type: detectedType };
    }
    async sendMessage(consultationId, senderId, contenido) {
        const [consultation] = await this.db
            .select()
            .from(schema_1.consultations)
            .where((0, drizzle_orm_1.eq)(schema_1.consultations.id, consultationId))
            .limit(1);
        if (!consultation)
            throw new common_1.NotFoundException('Consulta no encontrada');
        if (consultation.clientId !== senderId && consultation.lawyerId !== senderId) {
            throw new common_1.ForbiddenException('No tienes acceso a este chat');
        }
        const { blocked, sanitized, type } = this.detectAndBlock(contenido);
        const [message] = await this.db
            .insert(schema_1.messages)
            .values({ consultationId, senderId, contenido: sanitized, bloqueado: blocked, contenidoOriginal: blocked ? contenido : null })
            .returning();
        if (blocked) {
            await this.db.insert(schema_1.bypassAttempts).values({ userId: senderId, messageId: message.id, contenido, tipoBypass: type });
        }
        const recipientId = senderId === consultation.clientId ? consultation.lawyerId : consultation.clientId;
        const [sender] = await this.db.select({ firstName: schema_1.users.firstName, lastName: schema_1.users.lastName }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, senderId)).limit(1);
        const [recipient] = await this.db.select({ email: schema_1.users.email }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, recipientId)).limit(1);
        if (recipient?.email && !blocked) {
            void this.notificationsService.notifyNewMessage(recipient.email, `${sender?.firstName ?? ''} ${sender?.lastName ?? ''}`.trim(), contenido);
        }
        return message;
    }
    async getMessages(consultationId, userId) {
        const [consultation] = await this.db.select().from(schema_1.consultations).where((0, drizzle_orm_1.eq)(schema_1.consultations.id, consultationId)).limit(1);
        if (!consultation)
            throw new common_1.NotFoundException('Consulta no encontrada');
        if (consultation.clientId !== userId && consultation.lawyerId !== userId)
            throw new common_1.ForbiddenException('No tienes acceso a este chat');
        return this.db.select().from(schema_1.messages).where((0, drizzle_orm_1.eq)(schema_1.messages.consultationId, consultationId));
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_TOKEN)),
    __metadata("design:paramtypes", [Object, notifications_service_1.NotificationsService])
], ChatService);
//# sourceMappingURL=chat.service.js.map
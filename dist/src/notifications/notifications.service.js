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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const resend_1 = require("resend");
const notifications_constants_1 = require("./notifications.constants");
const ioredis_1 = __importDefault(require("ioredis"));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        const redisUrl = this.configService.get('REDIS_URL') ?? 'redis://localhost:6379';
        const connection = new ioredis_1.default(redisUrl, { maxRetriesPerRequest: null });
        this.queue = new bullmq_1.Queue(notifications_constants_1.NOTIFICATIONS_QUEUE, {
            connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: 100,
                removeOnFail: 50,
            },
        });
        const resendKey = this.configService.get('RESEND_API_KEY') ?? '';
        this.resend = new resend_1.Resend(resendKey);
        this.fromEmail =
            this.configService.get('RESEND_FROM_EMAIL') ?? 'noreply@midefensaperu.com';
    }
    async sendEmail(job) {
        try {
            if (!this.configService.get('RESEND_API_KEY')) {
                this.logger.warn(`[Mock Email] To: ${job.to}, Subject: ${job.subject}`);
                return;
            }
            await this.resend.emails.send({
                from: this.fromEmail,
                to: job.to,
                subject: job.subject,
                html: job.html,
            });
            this.logger.log(`Email sent to ${job.to}: ${job.subject}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${job.to}`, error);
            throw error;
        }
    }
    async queueEmail(job) {
        try {
            await this.queue.add(job.event, job);
        }
        catch (error) {
            this.logger.error('Failed to queue notification', error);
            await this.sendEmail(job);
        }
    }
    async notifyNewMessage(toEmail, senderName, preview) {
        await this.queueEmail({
            event: notifications_constants_1.NotificationEvent.NEW_MESSAGE,
            to: toEmail,
            subject: 'Nuevo mensaje en MiDefensaPeru',
            html: `
        <h2>Tienes un nuevo mensaje</h2>
        <p><strong>${senderName}</strong> te ha enviado un mensaje:</p>
        <blockquote>${preview.substring(0, 200)}${preview.length > 200 ? '...' : ''}</blockquote>
        <p><a href="${this.configService.get('FRONTEND_URL')}/mensajes">Ver mensaje</a></p>
      `,
        });
    }
    async notifyPaymentReceived(toEmail, lawyerName, amount) {
        await this.queueEmail({
            event: notifications_constants_1.NotificationEvent.PAYMENT_RECEIVED,
            to: toEmail,
            subject: 'Pago recibido - MiDefensaPeru',
            html: `
        <h2>Pago recibido</h2>
        <p>Has recibido un pago de S/ ${amount} de un cliente.</p>
        <p>El dinero está en escrow y será liberado cuando el cliente confirme el servicio.</p>
        <p><a href="${this.configService.get('FRONTEND_URL')}/consultas">Ver consulta</a></p>
      `,
        });
    }
    async notifyConsultationConfirmed(toEmail, amount, commission) {
        await this.queueEmail({
            event: notifications_constants_1.NotificationEvent.CONSULTATION_CONFIRMED,
            to: toEmail,
            subject: 'Consulta confirmada - Fondos liberados',
            html: `
        <h2>¡Consulta completada!</h2>
        <p>El cliente ha confirmado el servicio.</p>
        <p>Monto liberado: <strong>S/ ${amount}</strong></p>
        <p>Comisión de plataforma: S/ ${commission}</p>
        <p><a href="${this.configService.get('FRONTEND_URL')}/consultas">Ver detalles</a></p>
      `,
        });
    }
    async notifyNewReview(toEmail, rating, comment) {
        await this.queueEmail({
            event: notifications_constants_1.NotificationEvent.NEW_REVIEW,
            to: toEmail,
            subject: 'Nueva reseña recibida - MiDefensaPeru',
            html: `
        <h2>Tienes una nueva reseña</h2>
        <p>Rating: ${'⭐'.repeat(rating)} (${rating}/5)</p>
        ${comment ? `<p>Comentario: "${comment}"</p>` : ''}
        <p><a href="${this.configService.get('FRONTEND_URL')}/perfil">Ver tu perfil</a></p>
      `,
        });
    }
    async notifyLawyerVerified(toEmail, lawyerName) {
        await this.queueEmail({
            event: notifications_constants_1.NotificationEvent.LAWYER_VERIFIED,
            to: toEmail,
            subject: '¡Tu perfil ha sido verificado! - MiDefensaPeru',
            html: `
        <h2>¡Felicitaciones, ${lawyerName}!</h2>
        <p>Tu perfil de abogado ha sido verificado exitosamente.</p>
        <p>Ahora puedes recibir consultas de clientes en MiDefensaPeru.</p>
        <p><a href="${this.configService.get('FRONTEND_URL')}/dashboard">Ir al dashboard</a></p>
      `,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map
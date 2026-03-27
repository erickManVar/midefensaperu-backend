import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Resend } from 'resend';
import { NotificationEvent, NOTIFICATIONS_QUEUE } from './notifications.constants';
import IORedis from 'ioredis';

export interface NotificationJob {
  event: NotificationEvent;
  to: string;
  subject: string;
  html: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly queue: Queue<NotificationJob>;
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

    this.queue = new Queue<NotificationJob>(NOTIFICATIONS_QUEUE, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });

    const resendKey = this.configService.get<string>('RESEND_API_KEY') ?? '';
    this.resend = new Resend(resendKey);
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ?? 'noreply@midefensaperu.com';
  }

  async sendEmail(job: NotificationJob): Promise<void> {
    try {
      if (!this.configService.get<string>('RESEND_API_KEY')) {
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
    } catch (error) {
      this.logger.error(`Failed to send email to ${job.to}`, error);
      throw error;
    }
  }

  async queueEmail(job: NotificationJob): Promise<void> {
    try {
      await this.queue.add(job.event, job);
    } catch (error) {
      this.logger.error('Failed to queue notification', error);
      // Fallback: send directly
      await this.sendEmail(job);
    }
  }

  async notifyNewMessage(toEmail: string, senderName: string, preview: string): Promise<void> {
    await this.queueEmail({
      event: NotificationEvent.NEW_MESSAGE,
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

  async notifyPaymentReceived(
    toEmail: string,
    lawyerName: string,
    amount: string,
  ): Promise<void> {
    await this.queueEmail({
      event: NotificationEvent.PAYMENT_RECEIVED,
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

  async notifyConsultationConfirmed(
    toEmail: string,
    amount: string,
    commission: string,
  ): Promise<void> {
    await this.queueEmail({
      event: NotificationEvent.CONSULTATION_CONFIRMED,
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

  async notifyNewReview(toEmail: string, rating: number, comment?: string): Promise<void> {
    await this.queueEmail({
      event: NotificationEvent.NEW_REVIEW,
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

  async notifyLawyerVerified(toEmail: string, lawyerName: string): Promise<void> {
    await this.queueEmail({
      event: NotificationEvent.LAWYER_VERIFIED,
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
}

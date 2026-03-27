import { ConfigService } from '@nestjs/config';
import { NotificationEvent } from './notifications.constants';
export interface NotificationJob {
    event: NotificationEvent;
    to: string;
    subject: string;
    html: string;
    data?: Record<string, unknown>;
}
export declare class NotificationsService {
    private readonly configService;
    private readonly logger;
    private readonly queue;
    private readonly resend;
    private readonly fromEmail;
    constructor(configService: ConfigService);
    sendEmail(job: NotificationJob): Promise<void>;
    queueEmail(job: NotificationJob): Promise<void>;
    notifyNewMessage(toEmail: string, senderName: string, preview: string): Promise<void>;
    notifyPaymentReceived(toEmail: string, lawyerName: string, amount: string): Promise<void>;
    notifyConsultationConfirmed(toEmail: string, amount: string, commission: string): Promise<void>;
    notifyNewReview(toEmail: string, rating: number, comment?: string): Promise<void>;
    notifyLawyerVerified(toEmail: string, lawyerName: string): Promise<void>;
}

import { CreateConsultationDto, PayConsultationDto, DisputeConsultationDto } from './consultations.dto';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';
type DrizzleDB = NodePgDatabase<typeof schema>;
export declare class ConsultationsService {
    private readonly db;
    private readonly paymentsService;
    private readonly notificationsService;
    private readonly configService;
    private readonly commissionPercent;
    private readonly autoReleaseDays;
    constructor(db: DrizzleDB, paymentsService: PaymentsService, notificationsService: NotificationsService, configService: ConfigService);
    createConsultation(clientId: string, dto: CreateConsultationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        estado: "PENDING_PAYMENT" | "HELD" | "IN_PROGRESS" | "COMPLETED" | "DISPUTED" | "CANCELLED" | "RELEASED";
        clientId: string;
        lawyerId: string;
        monto: string;
        comision: string | null;
        escrowId: string | null;
        culqiChargeId: string | null;
        autoReleaseAt: Date | null;
        completedAt: Date | null;
        disputeReason: string | null;
    }>;
    payConsultation(consultationId: string, clientId: string, dto: PayConsultationDto): Promise<{
        success: boolean;
        chargeId: string;
    }>;
    confirmConsultation(consultationId: string, clientId: string): Promise<{
        success: boolean;
        montoLiberado: string;
        comision: string;
    }>;
    disputeConsultation(consultationId: string, clientId: string, dto: DisputeConsultationDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getClientConsultations(clientId: string): Promise<{
        id: string;
        clientId: string;
        lawyerId: string;
        monto: string;
        comision: string | null;
        estado: "PENDING_PAYMENT" | "HELD" | "IN_PROGRESS" | "COMPLETED" | "DISPUTED" | "CANCELLED" | "RELEASED";
        escrowId: string | null;
        culqiChargeId: string | null;
        descripcion: string | null;
        autoReleaseAt: Date | null;
        completedAt: Date | null;
        disputeReason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getLawyerConsultations(lawyerId: string): Promise<{
        id: string;
        clientId: string;
        lawyerId: string;
        monto: string;
        comision: string | null;
        estado: "PENDING_PAYMENT" | "HELD" | "IN_PROGRESS" | "COMPLETED" | "DISPUTED" | "CANCELLED" | "RELEASED";
        escrowId: string | null;
        culqiChargeId: string | null;
        descripcion: string | null;
        autoReleaseAt: Date | null;
        completedAt: Date | null;
        disputeReason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getConsultation(consultationId: string, userId: string): Promise<{
        id: string;
        clientId: string;
        lawyerId: string;
        monto: string;
        comision: string | null;
        estado: "PENDING_PAYMENT" | "HELD" | "IN_PROGRESS" | "COMPLETED" | "DISPUTED" | "CANCELLED" | "RELEASED";
        escrowId: string | null;
        culqiChargeId: string | null;
        descripcion: string | null;
        autoReleaseAt: Date | null;
        completedAt: Date | null;
        disputeReason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    processAutoReleases(): Promise<void>;
}
export {};

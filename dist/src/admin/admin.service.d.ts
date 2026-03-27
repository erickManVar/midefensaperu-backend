import { LawyersService } from '../lawyers/lawyers.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';
type DrizzleDB = NodePgDatabase<typeof schema>;
export declare class AdminService {
    private readonly db;
    private readonly lawyersService;
    private readonly notificationsService;
    constructor(db: DrizzleDB, lawyersService: LawyersService, notificationsService: NotificationsService);
    getPendingLawyers(): Promise<{
        id: string;
        userId: string;
        colegiatura: string;
        especialidades: string[];
        precio: string;
        ciudad: string;
        createdAt: Date;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
    }[]>;
    verifyLawyer(lawyerProfileId: string): Promise<{
        id: string;
        userId: string;
        colegiatura: string;
        especialidades: string[];
        precio: string;
        descripcion: string | null;
        aniosExperiencia: number;
        distrito: string | null;
        ciudad: string;
        estado: "PENDING_VERIFICATION" | "VERIFIED" | "SUSPENDED";
        rating: string;
        totalCases: number;
        totalReviews: number;
        fotoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    suspendLawyer(lawyerProfileId: string): Promise<{
        id: string;
        userId: string;
        colegiatura: string;
        especialidades: string[];
        precio: string;
        descripcion: string | null;
        aniosExperiencia: number;
        distrito: string | null;
        ciudad: string;
        estado: "PENDING_VERIFICATION" | "VERIFIED" | "SUSPENDED";
        rating: string;
        totalCases: number;
        totalReviews: number;
        fotoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getBypassAttempts(): Promise<{
        id: string;
        userId: string;
        messageId: string | null;
        contenido: string;
        tipoBypass: string | null;
        createdAt: Date;
    }[]>;
    getDisputedConsultations(): Promise<{
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
    resolveDispute(consultationId: string, favor: 'CLIENT' | 'LAWYER'): Promise<{
        success: boolean;
        favor: "CLIENT" | "LAWYER";
    }>;
    getStats(): Promise<{
        message: string;
    }>;
}
export {};

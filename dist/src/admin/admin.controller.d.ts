import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    pendingLawyers(): Promise<{
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
    verify(id: string): Promise<{
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
    suspend(id: string): Promise<{
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
    bypassAttempts(): Promise<{
        id: string;
        userId: string;
        messageId: string | null;
        contenido: string;
        tipoBypass: string | null;
        createdAt: Date;
    }[]>;
    disputed(): Promise<{
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
    resolve(id: string, body: {
        favor: 'CLIENT' | 'LAWYER';
    }): Promise<{
        success: boolean;
        favor: "CLIENT" | "LAWYER";
    }>;
    stats(): Promise<{
        message: string;
    }>;
}

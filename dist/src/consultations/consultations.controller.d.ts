import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto, PayConsultationDto, DisputeConsultationDto } from './consultations.dto';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
export declare class ConsultationsController {
    private readonly consultationsService;
    constructor(consultationsService: ConsultationsService);
    create(user: CurrentUserData, dto: CreateConsultationDto): Promise<{
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
    pay(id: string, user: CurrentUserData, dto: PayConsultationDto): Promise<{
        success: boolean;
        chargeId: string;
    }>;
    confirm(id: string, user: CurrentUserData): Promise<{
        success: boolean;
        montoLiberado: string;
        comision: string;
    }>;
    dispute(id: string, user: CurrentUserData, dto: DisputeConsultationDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getMy(user: CurrentUserData): Promise<{
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
    getOne(id: string, user: CurrentUserData): Promise<{
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
}

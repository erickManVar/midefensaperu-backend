import { ConfigService } from '@nestjs/config';
export interface CulqiChargeRequest {
    amount: number;
    currencyCode: string;
    email: string;
    sourceId: string;
    description: string;
    metadata?: Record<string, string>;
}
export interface CulqiChargeResponse {
    id: string;
    amount: number;
    currencyCode: string;
    email: string;
    object: string;
    outcome: {
        type: string;
        code: string;
        merchant_message: string;
        user_message: string;
    };
    metadata?: Record<string, string>;
}
export declare class PaymentsService {
    private readonly configService;
    private readonly logger;
    private readonly culqiUrl;
    private readonly secretKey;
    constructor(configService: ConfigService);
    createCharge(request: CulqiChargeRequest): Promise<CulqiChargeResponse>;
    refundCharge(chargeId: string, amount?: number): Promise<void>;
    private mockCharge;
    private httpPost;
    solesACentimos(soles: number): number;
}

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';

export interface CulqiChargeRequest {
  amount: number; // In centimos (soles * 100)
  currencyCode: string;
  email: string;
  sourceId: string; // Token from Culqi.js
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

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly culqiUrl: string;
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.culqiUrl =
      this.configService.get<string>('CULQI_URL') ?? 'https://api.culqi.com/v2';
    this.secretKey = this.configService.get<string>('CULQI_SECRET_KEY') ?? '';
  }

  async createCharge(request: CulqiChargeRequest): Promise<CulqiChargeResponse> {
    if (!this.secretKey || this.secretKey.startsWith('sk_test_xxx')) {
      this.logger.warn('Culqi in mock mode - no real charge created');
      return this.mockCharge(request);
    }

    try {
      const response = await this.httpPost<CulqiChargeResponse>('/charges', {
        amount: request.amount,
        currency_code: request.currencyCode,
        email: request.email,
        source_id: request.sourceId,
        description: request.description,
        metadata: request.metadata,
      });

      if (response.outcome?.type !== 'venta_exitosa') {
        throw new BadRequestException(
          response.outcome?.user_message ?? 'Pago rechazado',
        );
      }

      return response;
    } catch (error) {
      this.logger.error('Culqi charge failed', error);
      throw new BadRequestException('Error al procesar el pago');
    }
  }

  async refundCharge(chargeId: string, amount?: number): Promise<void> {
    if (!this.secretKey || this.secretKey.startsWith('sk_test_xxx')) {
      this.logger.warn(`Mock refund for charge: ${chargeId}`);
      return;
    }

    try {
      await this.httpPost('/refunds', {
        amount,
        reason: 'solicitud_comprador',
        charge_id: chargeId,
      });
    } catch (error) {
      this.logger.error(`Failed to refund charge ${chargeId}`, error);
      throw new BadRequestException('Error al procesar el reembolso');
    }
  }

  private mockCharge(request: CulqiChargeRequest): CulqiChargeResponse {
    return {
      id: `mock_charge_${Date.now()}`,
      amount: request.amount,
      currencyCode: request.currencyCode,
      email: request.email,
      object: 'charge',
      outcome: {
        type: 'venta_exitosa',
        code: '000',
        merchant_message: 'Mock charge successful',
        user_message: 'Pago procesado exitosamente',
      },
    };
  }

  private httpPost<T>(path: string, body: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const url = new URL(this.culqiUrl + path);

      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Length': Buffer.byteLength(data),
        },
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk: string) => (responseData += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(responseData) as T);
          } catch {
            reject(new Error('Invalid JSON response from Culqi'));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  solesACentimos(soles: number): number {
    return Math.round(soles * 100);
  }
}

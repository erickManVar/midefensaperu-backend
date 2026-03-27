"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const https = __importStar(require("https"));
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.culqiUrl =
            this.configService.get('CULQI_URL') ?? 'https://api.culqi.com/v2';
        this.secretKey = this.configService.get('CULQI_SECRET_KEY') ?? '';
    }
    async createCharge(request) {
        if (!this.secretKey || this.secretKey.startsWith('sk_test_xxx')) {
            this.logger.warn('Culqi in mock mode - no real charge created');
            return this.mockCharge(request);
        }
        try {
            const response = await this.httpPost('/charges', {
                amount: request.amount,
                currency_code: request.currencyCode,
                email: request.email,
                source_id: request.sourceId,
                description: request.description,
                metadata: request.metadata,
            });
            if (response.outcome?.type !== 'venta_exitosa') {
                throw new common_1.BadRequestException(response.outcome?.user_message ?? 'Pago rechazado');
            }
            return response;
        }
        catch (error) {
            this.logger.error('Culqi charge failed', error);
            throw new common_1.BadRequestException('Error al procesar el pago');
        }
    }
    async refundCharge(chargeId, amount) {
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
        }
        catch (error) {
            this.logger.error(`Failed to refund charge ${chargeId}`, error);
            throw new common_1.BadRequestException('Error al procesar el reembolso');
        }
    }
    mockCharge(request) {
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
    httpPost(path, body) {
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
                res.on('data', (chunk) => (responseData += chunk));
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(responseData));
                    }
                    catch {
                        reject(new Error('Invalid JSON response from Culqi'));
                    }
                });
            });
            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }
    solesACentimos(soles) {
        return Math.round(soles * 100);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../database/database.module");
const schema_1 = require("../database/schema");
const payments_service_1 = require("../payments/payments.service");
const pagination_util_1 = require("../common/utils/pagination.util");
let StoreService = class StoreService {
    constructor(db, paymentsService) {
        this.db = db;
        this.paymentsService = paymentsService;
    }
    async getProducts(cursor, limit = 10) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.products.isActive, true)];
        if (cursor)
            conditions.push((0, drizzle_orm_1.gt)(schema_1.products.id, (0, pagination_util_1.decodeCursor)(cursor)));
        const rows = await this.db.select().from(schema_1.products).where((0, drizzle_orm_1.and)(...conditions)).limit(limit + 1);
        const hasMore = rows.length > limit;
        const data = hasMore ? rows.slice(0, limit) : rows;
        return { data, nextCursor: hasMore && data.length > 0 ? (0, pagination_util_1.encodeCursor)(data[data.length - 1].id) : null, hasMore };
    }
    async createProduct(providerId, dto) {
        const [p] = await this.db.insert(schema_1.products).values({ providerId, nombre: dto.nombre, descripcion: dto.descripcion, precio: dto.precio.toString(), categoria: dto.categoria, stock: dto.stock, imagen: dto.imagen }).returning();
        return p;
    }
    async buyProduct(buyerId, productId, cantidad, culqiToken, email) {
        const [lawyer] = await this.db.select().from(schema_1.lawyerProfiles).where((0, drizzle_orm_1.eq)(schema_1.lawyerProfiles.userId, buyerId)).limit(1);
        if (!lawyer || lawyer.estado !== 'VERIFIED')
            throw new common_1.ForbiddenException('Solo abogados verificados pueden comprar en Lex Store');
        const [product] = await this.db.select().from(schema_1.products).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.id, productId), (0, drizzle_orm_1.eq)(schema_1.products.isActive, true))).limit(1);
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        if (product.stock < cantidad)
            throw new common_1.BadRequestException('Stock insuficiente');
        const precio = parseFloat(product.precio);
        const monto = precio * cantidad;
        const comision = monto * 0.1;
        const charge = await this.paymentsService.createCharge({ amount: this.paymentsService.solesACentimos(monto), currencyCode: 'PEN', email, sourceId: culqiToken, description: `Lex Store: ${product.nombre}` });
        await this.db.update(schema_1.products).set({ stock: product.stock - cantidad, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.products.id, productId));
        const [order] = await this.db.insert(schema_1.orders).values({ buyerId, productId, cantidad, monto: monto.toFixed(2), comision: comision.toFixed(2), estado: 'PAID', culqiChargeId: charge.id }).returning();
        return order;
    }
    async getProviderProducts(providerId) {
        return this.db.select().from(schema_1.products).where((0, drizzle_orm_1.eq)(schema_1.products.providerId, providerId));
    }
    async updateProduct(productId, providerId, dto) {
        const [product] = await this.db.select().from(schema_1.products).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.id, productId), (0, drizzle_orm_1.eq)(schema_1.products.providerId, providerId))).limit(1);
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        const [updated] = await this.db.update(schema_1.products).set({ ...dto, precio: dto.precio?.toString(), updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.products.id, productId)).returning();
        return updated;
    }
};
exports.StoreService = StoreService;
exports.StoreService = StoreService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DB_TOKEN)),
    __metadata("design:paramtypes", [Object, payments_service_1.PaymentsService])
], StoreService);
//# sourceMappingURL=store.service.js.map
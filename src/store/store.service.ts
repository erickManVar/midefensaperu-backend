import { ForbiddenException, Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { and, eq, gt, sql } from 'drizzle-orm';
import { DB_TOKEN } from '../database/database.module';
import { lawyerProfiles, orders, products } from '../database/schema';
import { PaymentsService } from '../payments/payments.service';
import { decodeCursor, encodeCursor } from '../common/utils/pagination.util';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';
type DrizzleDB = NodePgDatabase<typeof schema>;
@Injectable()
export class StoreService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB, private readonly paymentsService: PaymentsService) {}
  async getProducts(cursor?: string, limit = 10) {
    const conditions = [eq(products.isActive, true)];
    if (cursor) conditions.push(gt(products.id, decodeCursor(cursor)));
    const rows = await this.db.select().from(products).where(and(...conditions)).limit(limit + 1);
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    return { data, nextCursor: hasMore && data.length > 0 ? encodeCursor(data[data.length - 1].id) : null, hasMore };
  }
  async createProduct(providerId: string, dto: { nombre: string; descripcion?: string; precio: number; categoria: string; stock: number; imagen?: string }) {
    const [p] = await this.db.insert(products).values({ providerId, nombre: dto.nombre, descripcion: dto.descripcion, precio: dto.precio.toString(), categoria: dto.categoria as any, stock: dto.stock, imagen: dto.imagen }).returning();
    return p;
  }
  async buyProduct(buyerId: string, productId: string, cantidad: number, culqiToken: string, email: string) {
    const [lawyer] = await this.db.select().from(lawyerProfiles).where(eq(lawyerProfiles.userId, buyerId)).limit(1);
    if (!lawyer || lawyer.estado !== 'VERIFIED') throw new ForbiddenException('Solo abogados verificados pueden comprar en Lex Store');
    const [product] = await this.db.select().from(products).where(and(eq(products.id, productId), eq(products.isActive, true))).limit(1);
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.stock < cantidad) throw new BadRequestException('Stock insuficiente');
    const precio = parseFloat(product.precio);
    const monto = precio * cantidad;
    const comision = monto * 0.1;
    const charge = await this.paymentsService.createCharge({ amount: this.paymentsService.solesACentimos(monto), currencyCode: 'PEN', email, sourceId: culqiToken, description: `Lex Store: ${product.nombre}` });

    // Atomic stock deduction + order creation (prevents race condition)
    const order = await this.db.transaction(async (tx) => {
      const updated = await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${cantidad}`, updatedAt: new Date() })
        .where(and(eq(products.id, productId), sql`${products.stock} >= ${cantidad}`))
        .returning();

      if (updated.length === 0) {
        throw new BadRequestException('Stock insuficiente — otro usuario compró antes');
      }

      const [newOrder] = await tx.insert(orders).values({ buyerId, productId, cantidad, monto: monto.toFixed(2), comision: comision.toFixed(2), estado: 'PAID', culqiChargeId: charge.id }).returning();
      return newOrder;
    });

    return order;
  }
  async getProviderProducts(providerId: string) {
    return this.db.select().from(products).where(eq(products.providerId, providerId));
  }
  async updateProduct(productId: string, providerId: string, dto: Partial<{ nombre: string; descripcion: string; precio: number; stock: number; imagen: string; isActive: boolean }>) {
    const [product] = await this.db.select().from(products).where(and(eq(products.id, productId), eq(products.providerId, providerId))).limit(1);
    if (!product) throw new NotFoundException('Producto no encontrado');
    const [updated] = await this.db.update(products).set({ ...dto, precio: dto.precio?.toString(), updatedAt: new Date() }).where(eq(products.id, productId)).returning();
    return updated;
  }
}

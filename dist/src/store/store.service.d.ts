import { PaymentsService } from '../payments/payments.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';
type DrizzleDB = NodePgDatabase<typeof schema>;
export declare class StoreService {
    private readonly db;
    private readonly paymentsService;
    constructor(db: DrizzleDB, paymentsService: PaymentsService);
    getProducts(cursor?: string, limit?: number): Promise<{
        data: {
            id: string;
            providerId: string;
            nombre: string;
            descripcion: string | null;
            precio: string;
            categoria: "LIBROS" | "ROPA" | "ACCESORIOS" | "VIAJES" | "TECNOLOGIA" | "OTROS";
            stock: number;
            imagen: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    createProduct(providerId: string, dto: {
        nombre: string;
        descripcion?: string;
        precio: number;
        categoria: string;
        stock: number;
        imagen?: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        precio: string;
        descripcion: string | null;
        providerId: string;
        nombre: string;
        categoria: "LIBROS" | "ROPA" | "ACCESORIOS" | "VIAJES" | "TECNOLOGIA" | "OTROS";
        stock: number;
        imagen: string | null;
    }>;
    buyProduct(buyerId: string, productId: string, cantidad: number, culqiToken: string, email: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        estado: "CANCELLED" | "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "REFUNDED";
        monto: string;
        comision: string | null;
        culqiChargeId: string | null;
        buyerId: string;
        productId: string;
        cantidad: number;
    }>;
    getProviderProducts(providerId: string): Promise<{
        id: string;
        providerId: string;
        nombre: string;
        descripcion: string | null;
        precio: string;
        categoria: "LIBROS" | "ROPA" | "ACCESORIOS" | "VIAJES" | "TECNOLOGIA" | "OTROS";
        stock: number;
        imagen: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    updateProduct(productId: string, providerId: string, dto: Partial<{
        nombre: string;
        descripcion: string;
        precio: number;
        stock: number;
        imagen: string;
        isActive: boolean;
    }>): Promise<{
        id: string;
        providerId: string;
        nombre: string;
        descripcion: string | null;
        precio: string;
        categoria: "LIBROS" | "ROPA" | "ACCESORIOS" | "VIAJES" | "TECNOLOGIA" | "OTROS";
        stock: number;
        imagen: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};

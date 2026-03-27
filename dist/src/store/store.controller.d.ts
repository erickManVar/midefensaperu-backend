import { StoreService } from './store.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
export declare class StoreController {
    private readonly storeService;
    constructor(storeService: StoreService);
    getProducts(cursor?: string, limit?: string): Promise<{
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
    createProduct(user: CurrentUserData, dto: any): Promise<{
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
    updateProduct(id: string, user: CurrentUserData, dto: any): Promise<{
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
    buy(id: string, user: CurrentUserData, body: {
        cantidad: number;
        culqiToken: string;
        email: string;
    }): Promise<{
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
    myProducts(user: CurrentUserData): Promise<{
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
}

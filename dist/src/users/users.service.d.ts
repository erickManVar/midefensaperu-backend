import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';
type DrizzleDB = NodePgDatabase<typeof schema>;
export declare class UsersService {
    private readonly db;
    constructor(db: DrizzleDB);
    findById(id: string): Promise<{
        id: string;
        email: string;
        role: "CLIENT" | "LAWYER" | "PROVIDER" | "ADMIN";
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatarUrl: string | null;
        createdAt: Date;
    }>;
    updateProfile(id: string, dto: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatarUrl?: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatarUrl: string | null;
    }>;
}
export {};

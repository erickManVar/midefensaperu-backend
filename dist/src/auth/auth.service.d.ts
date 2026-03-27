import { ConfigService } from '@nestjs/config';
import { RegisterDto, LoginDto } from './auth.dto';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';
type DrizzleDB = NodePgDatabase<typeof schema>;
export declare class AuthService {
    private readonly db;
    private readonly configService;
    constructor(db: DrizzleDB, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            role: "CLIENT" | "LAWYER" | "PROVIDER" | "ADMIN";
            firstName: string | null;
            lastName: string | null;
        };
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            role: "CLIENT" | "LAWYER" | "PROVIDER" | "ADMIN";
            firstName: string | null;
            lastName: string | null;
        };
        token: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        role: "CLIENT" | "LAWYER" | "PROVIDER" | "ADMIN";
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatarUrl: string | null;
        emailVerified: boolean;
        createdAt: Date;
    }>;
    private generateToken;
}
export {};

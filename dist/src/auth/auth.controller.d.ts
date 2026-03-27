import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(user: CurrentUserData): Promise<{
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
}

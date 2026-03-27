import { UsersService } from './users.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: CurrentUserData): Promise<{
        id: string;
        email: string;
        role: "CLIENT" | "LAWYER" | "PROVIDER" | "ADMIN";
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatarUrl: string | null;
        createdAt: Date;
    }>;
    update(user: CurrentUserData, dto: any): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatarUrl: string | null;
    }>;
}

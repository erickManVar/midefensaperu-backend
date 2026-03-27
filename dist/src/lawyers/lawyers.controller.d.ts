import { LawyersService } from './lawyers.service';
import { CreateLawyerProfileDto, UpdateLawyerProfileDto, SearchLawyersDto } from './lawyers.dto';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
export declare class LawyersController {
    private readonly lawyersService;
    constructor(lawyersService: LawyersService);
    search(query: SearchLawyersDto): Promise<{
        data: {
            id: string;
            userId: string;
            colegiatura: string;
            especialidades: string[];
            precio: string;
            descripcion: string | null;
            aniosExperiencia: number;
            distrito: string | null;
            ciudad: string;
            estado: "PENDING_VERIFICATION" | "VERIFIED" | "SUSPENDED";
            rating: string;
            totalCases: number;
            fotoUrl: string | null;
            firstName: string | null;
            lastName: string | null;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    getById(id: string): Promise<{}>;
    createProfile(user: CurrentUserData, dto: CreateLawyerProfileDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        colegiatura: string;
        especialidades: string[];
        precio: string;
        descripcion: string | null;
        aniosExperiencia: number;
        distrito: string | null;
        ciudad: string;
        estado: "PENDING_VERIFICATION" | "VERIFIED" | "SUSPENDED";
        rating: string;
        totalCases: number;
        totalReviews: number;
        fotoUrl: string | null;
    }>;
    getMyProfile(user: CurrentUserData): Promise<{}>;
    updateProfile(user: CurrentUserData, dto: UpdateLawyerProfileDto): Promise<{
        id: string;
        userId: string;
        colegiatura: string;
        especialidades: string[];
        precio: string;
        descripcion: string | null;
        aniosExperiencia: number;
        distrito: string | null;
        ciudad: string;
        estado: "PENDING_VERIFICATION" | "VERIFIED" | "SUSPENDED";
        rating: string;
        totalCases: number;
        totalReviews: number;
        fotoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

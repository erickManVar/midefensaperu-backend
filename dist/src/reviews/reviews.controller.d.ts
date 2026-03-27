import { ReviewsService } from './reviews.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { z } from 'zod';
declare const CreateReviewSchema: z.ZodObject<{
    consultationId: z.ZodString;
    rating: z.ZodNumber;
    comentario: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    consultationId: string;
    rating: number;
    comentario?: string | undefined;
}, {
    consultationId: string;
    rating: number;
    comentario?: string | undefined;
}>;
declare const UpdateReviewSchema: z.ZodObject<{
    rating: z.ZodOptional<z.ZodNumber>;
    comentario: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rating?: number | undefined;
    comentario?: string | undefined;
}, {
    rating?: number | undefined;
    comentario?: string | undefined;
}>;
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(user: CurrentUserData, dto: z.infer<typeof CreateReviewSchema>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        lawyerId: string;
        consultationId: string;
        rating: number;
        comentario: string | null;
    }>;
    update(id: string, user: CurrentUserData, dto: z.infer<typeof UpdateReviewSchema>): Promise<{
        id: string;
        consultationId: string;
        clientId: string;
        lawyerId: string;
        rating: number;
        comentario: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getLawyerReviews(lawyerId: string): Promise<{
        id: string;
        consultationId: string;
        clientId: string;
        lawyerId: string;
        rating: number;
        comentario: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
export {};

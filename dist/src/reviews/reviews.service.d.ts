import { NotificationsService } from '../notifications/notifications.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';
type DrizzleDB = NodePgDatabase<typeof schema>;
export declare class ReviewsService {
    private readonly db;
    private readonly notificationsService;
    constructor(db: DrizzleDB, notificationsService: NotificationsService);
    createReview(clientId: string, dto: {
        consultationId: string;
        rating: number;
        comentario?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        lawyerId: string;
        consultationId: string;
        rating: number;
        comentario: string | null;
    }>;
    updateReview(reviewId: string, clientId: string, dto: {
        rating?: number;
        comentario?: string;
    }): Promise<{
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

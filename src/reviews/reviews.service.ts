import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, avg, count, eq, sql } from 'drizzle-orm';
import { DB_TOKEN } from '../database/database.module';
import { consultations, lawyerProfiles, reviews, users } from '../database/schema';
import { NotificationsService } from '../notifications/notifications.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';
type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createReview(clientId: string, dto: { consultationId: string; rating: number; comentario?: string }) {
    const [consultation] = await this.db.select().from(consultations)
      .where(and(eq(consultations.id, dto.consultationId), eq(consultations.clientId, clientId))).limit(1);
    if (!consultation) throw new NotFoundException('Consulta no encontrada');
    if (consultation.estado !== 'COMPLETED') throw new BadRequestException('Solo puedes reseñar consultas completadas');
    if (dto.rating < 1 || dto.rating > 5) throw new BadRequestException('Rating debe ser entre 1 y 5');

    // Transaction: insert review + update lawyer stats atomically
    const review = await this.db.transaction(async (tx) => {
      try {
        const [newReview] = await tx.insert(reviews).values({
          consultationId: dto.consultationId,
          clientId,
          lawyerId: consultation.lawyerId,
          rating: dto.rating,
          comentario: dto.comentario,
        }).returning();

        // SQL aggregate instead of loading all reviews into memory
        const [stats] = await tx
          .select({
            avgRating: sql<string>`COALESCE(AVG(${reviews.rating}), 0)`,
            totalReviews: count(),
          })
          .from(reviews)
          .where(eq(reviews.lawyerId, consultation.lawyerId));

        await tx.update(lawyerProfiles).set({
          rating: Number(stats.avgRating).toFixed(2),
          totalReviews: stats.totalReviews,
          updatedAt: new Date(),
        }).where(eq(lawyerProfiles.userId, consultation.lawyerId));

        return newReview;
      } catch (error: any) {
        // Unique constraint violation = duplicate review
        if (error?.code === '23505') {
          throw new ConflictException('Ya has dejado una reseña para esta consulta');
        }
        throw error;
      }
    });

    // Notification outside transaction
    const [lawyerUser] = await this.db.select({ email: users.email }).from(users)
      .where(eq(users.id, consultation.lawyerId)).limit(1);
    if (lawyerUser?.email) {
      void this.notificationsService.notifyNewReview(lawyerUser.email, dto.rating, dto.comentario);
    }

    return review;
  }

  async updateReview(reviewId: string, clientId: string, dto: { rating?: number; comentario?: string }) {
    const [review] = await this.db.select().from(reviews)
      .where(and(eq(reviews.id, reviewId), eq(reviews.clientId, clientId))).limit(1);
    if (!review) throw new NotFoundException('Reseña no encontrada');
    const hoursSince = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSince > 24) throw new BadRequestException('No puedes editar una reseña después de 24 horas');
    const [updated] = await this.db.update(reviews).set({
      rating: dto.rating ?? review.rating,
      comentario: dto.comentario ?? review.comentario,
      updatedAt: new Date(),
    }).where(eq(reviews.id, reviewId)).returning();
    return updated;
  }

  async getLawyerReviews(lawyerId: string) {
    return this.db.select().from(reviews).where(eq(reviews.lawyerId, lawyerId));
  }
}

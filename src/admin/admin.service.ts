import { Inject, Injectable } from '@nestjs/common';
import { count, eq, sql } from 'drizzle-orm';
import { DB_TOKEN } from '../database/database.module';
import { bypassAttempts, consultations, lawyerProfiles, reviews, users } from '../database/schema';
import { LawyersService } from '../lawyers/lawyers.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';
type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class AdminService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly lawyersService: LawyersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getPendingLawyers() { return this.lawyersService.getPendingVerification(); }

  async verifyLawyer(lawyerProfileId: string) {
    const profile = await this.lawyersService.verifyLawyer(lawyerProfileId);
    const [user] = await this.db.select({ email: users.email, firstName: users.firstName }).from(users).where(eq(users.id, profile.userId)).limit(1);
    if (user?.email) void this.notificationsService.notifyLawyerVerified(user.email, user.firstName ?? 'Abogado');
    return profile;
  }

  async suspendLawyer(lawyerProfileId: string) { return this.lawyersService.suspendLawyer(lawyerProfileId); }

  async getBypassAttempts() { return this.db.select().from(bypassAttempts); }

  async getDisputedConsultations() { return this.db.select().from(consultations).where(eq(consultations.estado, 'DISPUTED')); }

  async resolveDispute(consultationId: string, favor: 'CLIENT' | 'LAWYER') {
    const [consultation] = await this.db.select().from(consultations).where(eq(consultations.id, consultationId)).limit(1);
    if (!consultation) throw new Error('Consulta no encontrada');
    await this.db.update(consultations).set({ estado: favor === 'CLIENT' ? 'CANCELLED' : 'COMPLETED', updatedAt: new Date() }).where(eq(consultations.id, consultationId));
    return { success: true, favor };
  }

  async getStats() {
    const [[userCount], [lawyerCount], [consultationStats], [reviewCount]] = await Promise.all([
      this.db.select({ value: count() }).from(users),
      this.db.select({ value: count() }).from(lawyerProfiles),
      this.db.select({
        total: count(),
        completed: sql<number>`COUNT(CASE WHEN ${consultations.estado} = 'COMPLETED' THEN 1 END)`,
        disputed: sql<number>`COUNT(CASE WHEN ${consultations.estado} = 'DISPUTED' THEN 1 END)`,
        revenue: sql<string>`COALESCE(SUM(CASE WHEN ${consultations.estado} IN ('COMPLETED', 'RELEASED') THEN CAST(${consultations.comision} AS DECIMAL) ELSE 0 END), 0)`,
      }).from(consultations),
      this.db.select({ value: count() }).from(reviews),
    ]);

    return {
      totalUsers: userCount.value,
      totalLawyers: lawyerCount.value,
      totalConsultations: consultationStats.total,
      completedConsultations: consultationStats.completed,
      disputedConsultations: consultationStats.disputed,
      totalRevenue: Number(consultationStats.revenue),
      totalReviews: reviewCount.value,
    };
  }
}

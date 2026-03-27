import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_TOKEN } from '../database/database.module';
import { bypassAttempts, consultations, lawyerProfiles, users } from '../database/schema';
import { LawyersService } from '../lawyers/lawyers.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';
type DrizzleDB = NodePgDatabase<typeof schema>;
@Injectable()
export class AdminService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB, private readonly lawyersService: LawyersService, private readonly notificationsService: NotificationsService) {}
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
    const [totalUsers] = await this.db.select().from(users);
    return { message: 'Stats endpoint - to be expanded' };
  }
}

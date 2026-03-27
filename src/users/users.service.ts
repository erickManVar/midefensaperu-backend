import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_TOKEN } from '../database/database.module';
import { users } from '../database/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';
type DrizzleDB = NodePgDatabase<typeof schema>;
@Injectable()
export class UsersService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}
  async findById(id: string) {
    const [user] = await this.db.select({ id: users.id, email: users.email, role: users.role, firstName: users.firstName, lastName: users.lastName, phone: users.phone, avatarUrl: users.avatarUrl, createdAt: users.createdAt }).from(users).where(eq(users.id, id)).limit(1);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
  async updateProfile(id: string, dto: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }) {
    const [updated] = await this.db.update(users).set({ ...dto, updatedAt: new Date() }).where(eq(users.id, id)).returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName, phone: users.phone, avatarUrl: users.avatarUrl });
    return updated;
  }
}

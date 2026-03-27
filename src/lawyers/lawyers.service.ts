import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, gte, lte, gt, sql } from 'drizzle-orm';
import { DB_TOKEN } from '../database/database.module';
import { lawyerProfiles, users } from '../database/schema';
import {
  CreateLawyerProfileDto,
  UpdateLawyerProfileDto,
  SearchLawyersDto,
} from './lawyers.dto';
import NodeCache from 'node-cache';
import { encodeCursor, decodeCursor } from '../common/utils/pagination.util';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';

type DrizzleDB = NodePgDatabase<typeof schema>;

const lawyerCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

@Injectable()
export class LawyersService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async createProfile(userId: string, dto: CreateLawyerProfileDto) {
    const existing = await this.db
      .select()
      .from(lawyerProfiles)
      .where(eq(lawyerProfiles.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Ya tienes un perfil de abogado');
    }

    const colegiaturaExists = await this.db
      .select()
      .from(lawyerProfiles)
      .where(eq(lawyerProfiles.colegiatura, dto.colegiatura))
      .limit(1);

    if (colegiaturaExists.length > 0) {
      throw new ConflictException('Número de colegiatura ya registrado');
    }

    const [profile] = await this.db
      .insert(lawyerProfiles)
      .values({
        userId,
        colegiatura: dto.colegiatura,
        especialidades: dto.especialidades,
        precio: dto.precio.toString(),
        descripcion: dto.descripcion,
        aniosExperiencia: dto.aniosExperiencia,
        distrito: dto.distrito,
        ciudad: dto.ciudad,
        fotoUrl: dto.fotoUrl,
      })
      .returning();

    lawyerCache.del(`lawyer:${userId}`);
    return profile;
  }

  async getProfile(userId: string) {
    const cacheKey = `lawyer:${userId}`;
    const cached = lawyerCache.get(cacheKey);
    if (cached) return cached;

    const [profile] = await this.db
      .select()
      .from(lawyerProfiles)
      .where(eq(lawyerProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      throw new NotFoundException('Perfil de abogado no encontrado');
    }

    lawyerCache.set(cacheKey, profile);
    return profile;
  }

  async getProfileById(lawyerProfileId: string) {
    const cacheKey = `lawyer-id:${lawyerProfileId}`;
    const cached = lawyerCache.get(cacheKey);
    if (cached) return cached;

    const [profile] = await this.db
      .select({
        id: lawyerProfiles.id,
        userId: lawyerProfiles.userId,
        colegiatura: lawyerProfiles.colegiatura,
        especialidades: lawyerProfiles.especialidades,
        precio: lawyerProfiles.precio,
        descripcion: lawyerProfiles.descripcion,
        aniosExperiencia: lawyerProfiles.aniosExperiencia,
        distrito: lawyerProfiles.distrito,
        ciudad: lawyerProfiles.ciudad,
        estado: lawyerProfiles.estado,
        rating: lawyerProfiles.rating,
        totalCases: lawyerProfiles.totalCases,
        totalReviews: lawyerProfiles.totalReviews,
        fotoUrl: lawyerProfiles.fotoUrl,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(lawyerProfiles)
      .leftJoin(users, eq(lawyerProfiles.userId, users.id))
      .where(eq(lawyerProfiles.id, lawyerProfileId))
      .limit(1);

    if (!profile) {
      throw new NotFoundException('Abogado no encontrado');
    }

    lawyerCache.set(cacheKey, profile);
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateLawyerProfileDto) {
    const [existing] = await this.db
      .select()
      .from(lawyerProfiles)
      .where(eq(lawyerProfiles.userId, userId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Perfil de abogado no encontrado');
    }

    const updateData: Partial<typeof lawyerProfiles.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (dto.especialidades) updateData.especialidades = dto.especialidades;
    if (dto.precio !== undefined) updateData.precio = dto.precio.toString();
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;
    if (dto.aniosExperiencia !== undefined) updateData.aniosExperiencia = dto.aniosExperiencia;
    if (dto.distrito !== undefined) updateData.distrito = dto.distrito;
    if (dto.ciudad !== undefined) updateData.ciudad = dto.ciudad;
    if (dto.fotoUrl !== undefined) updateData.fotoUrl = dto.fotoUrl;

    const [updated] = await this.db
      .update(lawyerProfiles)
      .set(updateData)
      .where(eq(lawyerProfiles.userId, userId))
      .returning();

    lawyerCache.del(`lawyer:${userId}`);
    lawyerCache.del(`lawyer-id:${existing.id}`);

    return updated;
  }

  async searchLawyers(dto: SearchLawyersDto) {
    const conditions = [eq(lawyerProfiles.estado, 'VERIFIED')];

    if (dto.ciudad) {
      conditions.push(eq(lawyerProfiles.ciudad, dto.ciudad));
    }

    if (dto.precioMin !== undefined) {
      conditions.push(gte(lawyerProfiles.precio, dto.precioMin.toString()));
    }

    if (dto.precioMax !== undefined) {
      conditions.push(lte(lawyerProfiles.precio, dto.precioMax.toString()));
    }

    if (dto.ratingMin !== undefined) {
      conditions.push(gte(lawyerProfiles.rating, dto.ratingMin.toString()));
    }

    if (dto.cursor) {
      const cursorId = decodeCursor(dto.cursor);
      conditions.push(gt(lawyerProfiles.id, cursorId));
    }

    const limit = dto.limit + 1;

    let query = this.db
      .select({
        id: lawyerProfiles.id,
        userId: lawyerProfiles.userId,
        colegiatura: lawyerProfiles.colegiatura,
        especialidades: lawyerProfiles.especialidades,
        precio: lawyerProfiles.precio,
        descripcion: lawyerProfiles.descripcion,
        aniosExperiencia: lawyerProfiles.aniosExperiencia,
        distrito: lawyerProfiles.distrito,
        ciudad: lawyerProfiles.ciudad,
        estado: lawyerProfiles.estado,
        rating: lawyerProfiles.rating,
        totalCases: lawyerProfiles.totalCases,
        fotoUrl: lawyerProfiles.fotoUrl,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(lawyerProfiles)
      .leftJoin(users, eq(lawyerProfiles.userId, users.id))
      .where(and(...conditions))
      .limit(limit)
      .$dynamic();

    if (dto.especialidad) {
      query = query.where(
        sql`${lawyerProfiles.especialidades} @> ${JSON.stringify([dto.especialidad])}::jsonb`,
      );
    }

    const results = await query;

    const hasMore = results.length > dto.limit;
    const data = hasMore ? results.slice(0, dto.limit) : results;
    const nextCursor =
      hasMore && data.length > 0 ? encodeCursor(data[data.length - 1].id) : null;

    return {
      data,
      nextCursor,
      hasMore,
    };
  }

  async verifyLawyer(lawyerProfileId: string) {
    const [profile] = await this.db
      .update(lawyerProfiles)
      .set({ estado: 'VERIFIED', updatedAt: new Date() })
      .where(eq(lawyerProfiles.id, lawyerProfileId))
      .returning();

    if (!profile) {
      throw new NotFoundException('Perfil de abogado no encontrado');
    }

    lawyerCache.del(`lawyer-id:${lawyerProfileId}`);
    lawyerCache.del(`lawyer:${profile.userId}`);

    return profile;
  }

  async suspendLawyer(lawyerProfileId: string) {
    const [profile] = await this.db
      .update(lawyerProfiles)
      .set({ estado: 'SUSPENDED', updatedAt: new Date() })
      .where(eq(lawyerProfiles.id, lawyerProfileId))
      .returning();

    if (!profile) {
      throw new NotFoundException('Perfil de abogado no encontrado');
    }

    lawyerCache.del(`lawyer-id:${lawyerProfileId}`);
    lawyerCache.del(`lawyer:${profile.userId}`);

    return profile;
  }

  async getPendingVerification() {
    return this.db
      .select({
        id: lawyerProfiles.id,
        userId: lawyerProfiles.userId,
        colegiatura: lawyerProfiles.colegiatura,
        especialidades: lawyerProfiles.especialidades,
        precio: lawyerProfiles.precio,
        ciudad: lawyerProfiles.ciudad,
        createdAt: lawyerProfiles.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(lawyerProfiles)
      .leftJoin(users, eq(lawyerProfiles.userId, users.id))
      .where(eq(lawyerProfiles.estado, 'PENDING_VERIFICATION'));
  }

  invalidateCache(userId: string, profileId?: string) {
    lawyerCache.del(`lawyer:${userId}`);
    if (profileId) lawyerCache.del(`lawyer-id:${profileId}`);
  }
}

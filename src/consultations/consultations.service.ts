import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DB_TOKEN } from '../database/database.module';
import { consultations, lawyerProfiles, users } from '../database/schema';
import { CreateConsultationDto, PayConsultationDto, DisputeConsultationDto } from './consultations.dto';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';

type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class ConsultationsService {
  private readonly commissionPercent: number;
  private readonly autoReleaseDays: number;

  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly paymentsService: PaymentsService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {
    this.commissionPercent = Number(
      this.configService.get<string>('PLATFORM_COMMISSION_PERCENT') ?? '20',
    );
    this.autoReleaseDays = Number(
      this.configService.get<string>('ESCROW_AUTO_RELEASE_DAYS') ?? '7',
    );
  }

  async createConsultation(clientId: string, dto: CreateConsultationDto) {
    // Get lawyer profile by userId
    const [lawyerProfile] = await this.db
      .select()
      .from(lawyerProfiles)
      .where(eq(lawyerProfiles.userId, dto.lawyerId))
      .limit(1);

    if (!lawyerProfile) {
      throw new NotFoundException('Abogado no encontrado');
    }

    if (lawyerProfile.estado !== 'VERIFIED') {
      throw new BadRequestException('El abogado no está verificado');
    }

    if (clientId === dto.lawyerId) {
      throw new BadRequestException('No puedes contratarte a ti mismo');
    }

    const autoReleaseAt = new Date();
    autoReleaseAt.setDate(autoReleaseAt.getDate() + this.autoReleaseDays);

    const [consultation] = await this.db
      .insert(consultations)
      .values({
        clientId,
        lawyerId: dto.lawyerId,
        monto: lawyerProfile.precio,
        estado: 'PENDING_PAYMENT',
        descripcion: dto.descripcion,
        autoReleaseAt,
      })
      .returning();

    return consultation;
  }

  async payConsultation(consultationId: string, clientId: string, dto: PayConsultationDto) {
    const [consultation] = await this.db
      .select()
      .from(consultations)
      .where(and(eq(consultations.id, consultationId), eq(consultations.clientId, clientId)))
      .limit(1);

    if (!consultation) {
      throw new NotFoundException('Consulta no encontrada');
    }

    if (consultation.estado !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Esta consulta ya fue pagada o está en otro estado');
    }

    const amount = parseFloat(consultation.monto);
    const amountCentimos = this.paymentsService.solesACentimos(amount);

    const charge = await this.paymentsService.createCharge({
      amount: amountCentimos,
      currencyCode: 'PEN',
      email: dto.email,
      sourceId: dto.culqiToken,
      description: `Consulta legal MiDefensaPeru - ${consultationId}`,
      metadata: { consultationId, clientId },
    });

    const commissionAmount = (amount * this.commissionPercent) / 100;

    await this.db
      .update(consultations)
      .set({
        estado: 'HELD',
        escrowId: `escrow_${consultationId}`,
        culqiChargeId: charge.id,
        comision: commissionAmount.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(consultations.id, consultationId));

    // Notify lawyer
    const [lawyerUser] = await this.db
      .select({ email: users.email, firstName: users.firstName })
      .from(users)
      .where(eq(users.id, consultation.lawyerId))
      .limit(1);

    if (lawyerUser?.email) {
      void this.notificationsService.notifyPaymentReceived(
        lawyerUser.email,
        lawyerUser.firstName ?? 'Abogado',
        amount.toFixed(2),
      );
    }

    return { success: true, chargeId: charge.id };
  }

  async confirmConsultation(consultationId: string, clientId: string) {
    const [consultation] = await this.db
      .select()
      .from(consultations)
      .where(and(eq(consultations.id, consultationId), eq(consultations.clientId, clientId)))
      .limit(1);

    if (!consultation) {
      throw new NotFoundException('Consulta no encontrada');
    }

    if (!['HELD', 'IN_PROGRESS'].includes(consultation.estado)) {
      throw new BadRequestException('Esta consulta no puede ser confirmada en su estado actual');
    }

    const monto = parseFloat(consultation.monto);
    const comision = parseFloat(consultation.comision ?? '0');
    const montoAbogado = (monto - comision).toFixed(2);

    await this.db
      .update(consultations)
      .set({
        estado: 'COMPLETED',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(consultations.id, consultationId));

    // Update lawyer stats
    await this.db
      .update(lawyerProfiles)
      .set({
        totalCases: lawyerProfiles.totalCases,
        updatedAt: new Date(),
      })
      .where(eq(lawyerProfiles.userId, consultation.lawyerId));

    // Notify lawyer
    const [lawyerUser] = await this.db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, consultation.lawyerId))
      .limit(1);

    if (lawyerUser?.email) {
      void this.notificationsService.notifyConsultationConfirmed(
        lawyerUser.email,
        montoAbogado,
        comision.toFixed(2),
      );
    }

    return { success: true, montoLiberado: montoAbogado, comision: comision.toFixed(2) };
  }

  async disputeConsultation(
    consultationId: string,
    clientId: string,
    dto: DisputeConsultationDto,
  ) {
    const [consultation] = await this.db
      .select()
      .from(consultations)
      .where(and(eq(consultations.id, consultationId), eq(consultations.clientId, clientId)))
      .limit(1);

    if (!consultation) {
      throw new NotFoundException('Consulta no encontrada');
    }

    if (!['HELD', 'IN_PROGRESS'].includes(consultation.estado)) {
      throw new BadRequestException('No se puede disputar esta consulta en su estado actual');
    }

    await this.db
      .update(consultations)
      .set({
        estado: 'DISPUTED',
        disputeReason: dto.reason,
        updatedAt: new Date(),
      })
      .where(eq(consultations.id, consultationId));

    return { success: true, message: 'Disputa registrada. El equipo de MiDefensaPeru revisará el caso.' };
  }

  async getClientConsultations(clientId: string) {
    return this.db
      .select()
      .from(consultations)
      .where(eq(consultations.clientId, clientId));
  }

  async getLawyerConsultations(lawyerId: string) {
    return this.db
      .select()
      .from(consultations)
      .where(eq(consultations.lawyerId, lawyerId));
  }

  async getConsultation(consultationId: string, userId: string) {
    const [consultation] = await this.db
      .select()
      .from(consultations)
      .where(eq(consultations.id, consultationId))
      .limit(1);

    if (!consultation) {
      throw new NotFoundException('Consulta no encontrada');
    }

    if (consultation.clientId !== userId && consultation.lawyerId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta consulta');
    }

    return consultation;
  }

  async processAutoReleases(): Promise<void> {
    const now = new Date();
    const toRelease = await this.db
      .select()
      .from(consultations)
      .where(and(eq(consultations.estado, 'HELD')));

    for (const consultation of toRelease) {
      if (consultation.autoReleaseAt && consultation.autoReleaseAt <= now) {
        const monto = parseFloat(consultation.monto);
        const comision = (monto * this.commissionPercent) / 100;

        await this.db
          .update(consultations)
          .set({
            estado: 'RELEASED',
            comision: comision.toFixed(2),
            completedAt: now,
            updatedAt: now,
          })
          .where(eq(consultations.id, consultation.id));
      }
    }
  }
}

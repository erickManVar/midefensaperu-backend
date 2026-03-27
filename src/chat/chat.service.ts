import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_TOKEN } from '../database/database.module';
import { bypassAttempts, consultations, messages, users } from '../database/schema';
import { NotificationsService } from '../notifications/notifications.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';

type DrizzleDB = NodePgDatabase<typeof schema>;

const CONTACT_PATTERNS = [
  { regex: /(\+?[\d\s\-()]{7,})/g, type: 'phone' },
  { regex: /[\w.-]+@[\w.-]+\.\w{2,}/g, type: 'email' },
  { regex: /(https?:\/\/)?(wa\.me|whatsapp\.com)\S*/gi, type: 'whatsapp' },
  { regex: /(https?:\/\/)?(instagram\.com|t\.me|facebook\.com|twitter\.com|tiktok\.com)\S*/gi, type: 'social' },
  { regex: /@[\w.]+/g, type: 'social_handle' },
];
const BLOCKED_MESSAGE = '[Contacto externo bloqueado. Usa la plataforma para comunicarte]';

@Injectable()
export class ChatService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly notificationsService: NotificationsService,
  ) {}

  private detectAndBlock(content: string): { blocked: boolean; sanitized: string; type?: string } {
    let blocked = false;
    let detectedType: string | undefined;
    for (const pattern of CONTACT_PATTERNS) {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      if (regex.test(content)) {
        blocked = true;
        detectedType = pattern.type;
        break;
      }
    }
    return { blocked, sanitized: blocked ? BLOCKED_MESSAGE : content, type: detectedType };
  }

  async sendMessage(consultationId: string, senderId: string, contenido: string) {
    const [consultation] = await this.db
      .select()
      .from(consultations)
      .where(eq(consultations.id, consultationId))
      .limit(1);
    if (!consultation) throw new NotFoundException('Consulta no encontrada');
    if (consultation.clientId !== senderId && consultation.lawyerId !== senderId) {
      throw new ForbiddenException('No tienes acceso a este chat');
    }
    const { blocked, sanitized, type } = this.detectAndBlock(contenido);
    const [message] = await this.db
      .insert(messages)
      .values({ consultationId, senderId, contenido: sanitized, bloqueado: blocked, contenidoOriginal: blocked ? contenido : null })
      .returning();
    if (blocked) {
      await this.db.insert(bypassAttempts).values({ userId: senderId, messageId: message.id, contenido, tipoBypass: type });
    }
    const recipientId = senderId === consultation.clientId ? consultation.lawyerId : consultation.clientId;
    const [sender] = await this.db.select({ firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, senderId)).limit(1);
    const [recipient] = await this.db.select({ email: users.email }).from(users).where(eq(users.id, recipientId)).limit(1);
    if (recipient?.email && !blocked) {
      void this.notificationsService.notifyNewMessage(recipient.email, `${sender?.firstName ?? ''} ${sender?.lastName ?? ''}`.trim(), contenido);
    }
    return message;
  }

  async getMessages(consultationId: string, userId: string) {
    const [consultation] = await this.db.select().from(consultations).where(eq(consultations.id, consultationId)).limit(1);
    if (!consultation) throw new NotFoundException('Consulta no encontrada');
    if (consultation.clientId !== userId && consultation.lawyerId !== userId) throw new ForbiddenException('No tienes acceso a este chat');
    return this.db.select().from(messages).where(eq(messages.consultationId, consultationId));
  }
}

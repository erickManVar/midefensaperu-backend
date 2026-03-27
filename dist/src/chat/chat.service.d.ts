import { NotificationsService } from '../notifications/notifications.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';
type DrizzleDB = NodePgDatabase<typeof schema>;
export declare class ChatService {
    private readonly db;
    private readonly notificationsService;
    constructor(db: DrizzleDB, notificationsService: NotificationsService);
    private detectAndBlock;
    sendMessage(consultationId: string, senderId: string, contenido: string): Promise<{
        id: string;
        createdAt: Date;
        consultationId: string;
        senderId: string;
        contenido: string;
        bloqueado: boolean;
        contenidoOriginal: string | null;
    }>;
    getMessages(consultationId: string, userId: string): Promise<{
        id: string;
        consultationId: string;
        senderId: string;
        contenido: string;
        bloqueado: boolean;
        contenidoOriginal: string | null;
        createdAt: Date;
    }[]>;
}
export {};

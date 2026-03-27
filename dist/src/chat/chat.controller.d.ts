import { ChatService } from './chat.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    send(consultationId: string, user: CurrentUserData, body: {
        contenido: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        consultationId: string;
        senderId: string;
        contenido: string;
        bloqueado: boolean;
        contenidoOriginal: string | null;
    }>;
    getMessages(consultationId: string, user: CurrentUserData): Promise<{
        id: string;
        consultationId: string;
        senderId: string;
        contenido: string;
        bloqueado: boolean;
        contenidoOriginal: string | null;
        createdAt: Date;
    }[]>;
}

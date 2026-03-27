import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

const SendMessageSchema = z.object({ contenido: z.string().min(1).max(5000) });

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':consultationId')
  async send(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: CurrentUserData,
    @Body(new ZodValidationPipe(SendMessageSchema)) body: { contenido: string },
  ) {
    return this.chatService.sendMessage(consultationId, user.id, body.contenido);
  }

  @Get(':consultationId')
  async getMessages(@Param('consultationId') consultationId: string, @CurrentUser() user: CurrentUserData) {
    return this.chatService.getMessages(consultationId, user.id);
  }
}

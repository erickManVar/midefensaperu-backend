import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { createNotificationsWorker } from './notifications.processor';

@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule implements OnModuleInit {
  private readonly logger = new Logger(NotificationsModule.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    try {
      createNotificationsWorker(this.notificationsService, this.configService);
      this.logger.log('Notifications worker started');
    } catch (error) {
      this.logger.warn('Notifications worker failed to start — emails will use direct send fallback', error);
    }
  }
}

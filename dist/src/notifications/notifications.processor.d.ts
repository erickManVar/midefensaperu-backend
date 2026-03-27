import { Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
export declare function createNotificationsWorker(notificationsService: NotificationsService, configService: ConfigService): Worker;

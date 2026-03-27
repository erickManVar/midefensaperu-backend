import { Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { NotificationsService, NotificationJob } from './notifications.service';
import { NOTIFICATIONS_QUEUE } from './notifications.constants';

export function createNotificationsWorker(
  notificationsService: NotificationsService,
  configService: ConfigService,
): Worker {
  const logger = new Logger('NotificationsWorker');
  const redisUrl = configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

  const worker = new Worker<NotificationJob>(
    NOTIFICATIONS_QUEUE,
    async (job: Job<NotificationJob>) => {
      logger.log(`Processing notification job: ${job.name} for ${job.data.to}`);
      await notificationsService.sendEmail(job.data);
    },
    { connection, concurrency: 5 },
  );

  worker.on('completed', (job) => {
    logger.log(`Notification job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Notification job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}

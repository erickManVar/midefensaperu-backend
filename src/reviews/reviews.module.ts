import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { CommonModule } from '../common/common.module';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({ imports: [CommonModule, NotificationsModule], controllers: [ReviewsController], providers: [ReviewsService] })
export class ReviewsModule {}

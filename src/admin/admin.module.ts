import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CommonModule } from '../common/common.module';
import { LawyersModule } from '../lawyers/lawyers.module';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({ imports: [CommonModule, LawyersModule, NotificationsModule], controllers: [AdminController], providers: [AdminService] })
export class AdminModule {}

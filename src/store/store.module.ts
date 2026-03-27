import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { CommonModule } from '../common/common.module';
import { PaymentsModule } from '../payments/payments.module';
@Module({ imports: [CommonModule, PaymentsModule], controllers: [StoreController], providers: [StoreService] })
export class StoreModule {}

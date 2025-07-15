import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { ShopSubscriptionController } from 'src/presentation/controllers/ShopSubscription.controller';

@Module({
    imports: [CoreModule],
    controllers: [ShopSubscriptionController],
})
export class ShopSubscriptionModule { } 
import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { NewsletterSubscriptionController } from '../../presentation/controllers/NewsletterSubscription.controller';
import { SubscriptionController } from '../../presentation/controllers/Subscription.controller';

@Module({
    imports: [CoreModule],
    controllers: [SubscriptionController],
})
export class SubscriptionModule { } 
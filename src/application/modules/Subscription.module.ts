import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { NewsletterSubscriptionController } from 'src/presentation/controllers/NewsletterSubscription.controller';
import { SubscriptionController } from 'src/presentation/controllers/Subscription.controller';

@Module({
    imports: [CoreModule],
    controllers: [SubscriptionController],
})
export class SubscriptionModule { } 
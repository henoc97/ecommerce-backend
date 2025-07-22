import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { NewsletterSubscriptionController } from '../../presentation/controllers/NewsletterSubscription.controller';

@Module({
    imports: [CoreModule],
    controllers: [NewsletterSubscriptionController],
})
export class NewsletterSubscriptionModule { } 
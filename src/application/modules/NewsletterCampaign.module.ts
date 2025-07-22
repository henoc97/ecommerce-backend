import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { NewsletterCampaignController } from '../../presentation/controllers/NewsletterCampaign.controller';

@Module({
    imports: [CoreModule],
    controllers: [NewsletterCampaignController],
})
export class NewsletterCampaignModule { } 
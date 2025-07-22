import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { AnalyticsController } from '../../presentation/controllers/Analytics.controller';

@Module({
    imports: [CoreModule],
    controllers: [AnalyticsController],
})
export class AnalyticsModule { } 
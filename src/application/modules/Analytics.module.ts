import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { AnalyticsController } from 'src/presentation/controllers/Analytics.controller';

@Module({
    imports: [CoreModule],
    controllers: [AnalyticsController],
})
export class AnalyticsModule { } 
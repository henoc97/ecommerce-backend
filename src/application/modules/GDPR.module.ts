import { Module } from '@nestjs/common';
import { GDPRController } from '../../presentation/controllers/GDPR.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [GDPRController],
})
export class GDPRModule { } 
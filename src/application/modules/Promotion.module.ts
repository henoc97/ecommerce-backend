import { Module } from '@nestjs/common';
import { PromotionController } from '../../presentation/controllers/Promotion.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [PromotionController],
})
export class PromotionModule { }

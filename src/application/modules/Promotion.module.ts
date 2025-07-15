import { Module } from '@nestjs/common';
import { PromotionController } from 'src/presentation/controllers/Promotion.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [PromotionController],
})
export class PromotionModule { }

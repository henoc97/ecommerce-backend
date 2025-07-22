import { Module } from '@nestjs/common';
import { ReviewController } from '../../presentation/controllers/Review.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [ReviewController],
})
export class ReviewModule { } 
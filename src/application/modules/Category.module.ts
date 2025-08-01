import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { CategoryController } from '../../presentation/controllers/Category.controller';

@Module({
    imports: [CoreModule],
    controllers: [CategoryController],
})
export class CategoryModule { } 
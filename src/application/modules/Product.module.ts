import { Module } from '@nestjs/common';
import { ProductController } from 'src/presentation/controllers/Product.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [ProductController],
})
export class ProductModule { } 
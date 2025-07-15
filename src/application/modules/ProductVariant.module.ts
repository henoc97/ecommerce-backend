import { Module } from '@nestjs/common';
import { ProductVariantController } from 'src/presentation/controllers/ProductVariant.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [ProductVariantController],
})
export class ProductVariantModule { } 
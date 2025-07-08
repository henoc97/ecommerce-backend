import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { CartController } from 'src/presentation/controllers/Cart.controller';

@Module({
    imports: [CoreModule],
    controllers: [CartController],
})
export class ProductModule { } 
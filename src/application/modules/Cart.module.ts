import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { CartController } from '../../presentation/controllers/Cart.controller';

@Module({
    imports: [CoreModule],
    controllers: [CartController],
})
export class CartModule { } 

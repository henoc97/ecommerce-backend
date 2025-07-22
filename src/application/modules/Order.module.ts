import { Module } from '@nestjs/common';
import { CoreModule } from './Core.module';
import { OrderController } from '../../presentation/controllers/Order.controller';

@Module({
    imports: [CoreModule],
    controllers: [OrderController],
})
export class OrderModule { } 
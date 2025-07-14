import { Module } from '@nestjs/common';
import { PaymentController } from '../../presentation/controllers/Payment.controller';
import { CoreModule } from './Core.module';

@Module({
    imports: [CoreModule],
    controllers: [PaymentController],
})
export class PaymentModule { } 
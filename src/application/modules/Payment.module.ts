import { Module } from '@nestjs/common';
import { PaymentController } from '../../presentation/controllers/Payment.controller';
import { PaymentService } from '../services/payment.service';
import { OrderService } from '../services/order.service';
import { ProcessPaymentUseCase } from '../use-cases/payment.use-case/ProcessPayment.use-case';
import { PaymentPrismaRepository } from '../../infrastructure/impl.repositories/PaymentPrisma.repository';
import { OrderPrismaRepository } from '../../infrastructure/impl.repositories/OrderPrisma.repository';
import {
    StripePaymentGatewayService,
    PayPalPaymentGatewayService,
    PaymentGatewayFactory
} from '../services/payment-gateway.service';

@Module({
    controllers: [PaymentController],
    providers: [
        PaymentService,
        OrderService,
        ProcessPaymentUseCase,
        PaymentPrismaRepository,
        OrderPrismaRepository,
        StripePaymentGatewayService,
        PayPalPaymentGatewayService,
        PaymentGatewayFactory,
    ],
    exports: [PaymentService, ProcessPaymentUseCase, PaymentGatewayFactory],
})
export class PaymentModule { } 
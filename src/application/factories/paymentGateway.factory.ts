import { Injectable } from "@nestjs/common";
import { PaymentGatewayRepository } from "src/domain/repositories/PaymentGateway.repository";
import { PayPalPaymentGatewayService } from "src/infrastructure/external-services/payPalPaymentGateway.service";
import { StripePaymentGatewayService } from "src/infrastructure/external-services/stripePaymentGateway.service";

@Injectable()
export class PaymentGatewayFactory {
    constructor(
        private readonly stripeService: StripePaymentGatewayService,
        private readonly paypalService: PayPalPaymentGatewayService,
    ) { }

    getService(method: string): PaymentGatewayRepository {
        switch (method.toLowerCase()) {
            case 'stripe':
                return this.stripeService;
            case 'paypal':
                return this.paypalService;
            default:
                throw new Error(`Méthode de paiement non supportée: ${method}`);
        }
    }
} 
import { PaymentGatewayRequest, PaymentGatewayResponse } from "../entities/PaymentGateway.entity";

export interface PaymentGatewayRepository {
    processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse>;
    refundPayment(providerId: string, amount?: number): Promise<PaymentGatewayResponse>;
}
import { Injectable, Logger } from '@nestjs/common';
import { PaymentGatewayRequest, PaymentGatewayResponse } from 'src/domain/entities/PaymentGateway.entity';
import { PaymentGatewayRepository } from 'src/domain/repositories/PaymentGateway.repository';


@Injectable()
export abstract class BasePaymentGatewayService implements PaymentGatewayRepository {
    protected readonly logger = new Logger(this.constructor.name);

    abstract processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse>;
    abstract refundPayment(providerId: string, amount?: number): Promise<PaymentGatewayResponse>;

    protected handleError(error: any): PaymentGatewayResponse {
        this.logger.error(`Payment gateway error: ${error.message}`, error.stack);

        return {
            success: false,
            errorCode: error.code || 'unknown_error',
            errorMessage: error.message || 'Une erreur inconnue est survenue',
            details: {
                timestamp: new Date().toISOString(),
                errorType: error.type || 'gateway_error',
                ...error
            }
        };
    }

    protected validateRequest(request: PaymentGatewayRequest): boolean {
        if (!request.amount || request.amount <= 0) {
            throw new Error('Montant invalide');
        }
        if (!request.currency) {
            throw new Error('Devise requise');
        }
        if (!request.method) {
            throw new Error('Méthode de paiement requise');
        }
        return true;
    }
}

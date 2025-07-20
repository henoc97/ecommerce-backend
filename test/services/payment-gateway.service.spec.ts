import { BasePaymentGatewayService } from '../../src/application/services/payment-gateway.service';
import { PaymentGatewayRequest, PaymentGatewayResponse } from '../../src/domain/entities/PaymentGateway.entity';

describe('BasePaymentGatewayService', () => {
    class TestGateway extends BasePaymentGatewayService {
        async processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
            throw new Error('not implemented');
        }
        async refundPayment(providerId: string, amount?: number): Promise<PaymentGatewayResponse> {
            throw new Error('not implemented');
        }
        // Expose les méthodes protected pour les tests
        public testValidateRequest(request: PaymentGatewayRequest) {
            return this.validateRequest(request);
        }
        public testHandleError(error: any) {
            return this.handleError(error);
        }
    }
    let service: TestGateway;

    beforeEach(() => {
        service = new TestGateway();
    });

    describe('validateRequest', () => {
        it('doit lever une erreur si montant invalide', () => {
            expect(() => service.testValidateRequest({ amount: 0, currency: 'EUR', method: 'card' } as PaymentGatewayRequest)).toThrow('Montant invalide');
        });
        it('doit lever une erreur si devise manquante', () => {
            expect(() => service.testValidateRequest({ amount: 10, currency: '', method: 'card' } as PaymentGatewayRequest)).toThrow('Devise requise');
        });
        it('doit lever une erreur si méthode manquante', () => {
            expect(() => service.testValidateRequest({ amount: 10, currency: 'EUR', method: '' } as PaymentGatewayRequest)).toThrow('Méthode de paiement requise');
        });
        it('retourne true si la requête est valide', () => {
            expect(service.testValidateRequest({ amount: 10, currency: 'EUR', method: 'card' } as PaymentGatewayRequest)).toBe(true);
        });
    });

    describe('handleError', () => {
        it('doit mapper une erreur en PaymentGatewayResponse', () => {
            const error = { message: 'fail', code: 'ERR', type: 'fatal', stack: 'stack' };
            const res = service.testHandleError(error);
            expect(res.success).toBe(false);
            expect(res.errorCode).toBe('ERR');
            expect(res.errorMessage).toBe('fail');
            expect(res.details.errorType).toBe('fatal');
            expect(res.details.timestamp).toBeDefined();
        });
        it('doit gérer une erreur sans code/message/type', () => {
            const error = {};
            const res = service.testHandleError(error);
            expect(res.success).toBe(false);
            expect(res.errorCode).toBe('unknown_error');
            expect(res.errorMessage).toBe('Une erreur inconnue est survenue');
            expect(res.details.errorType).toBe('gateway_error');
        });
    });
}); 
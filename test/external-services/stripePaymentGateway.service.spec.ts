import { StripePaymentGatewayService } from '../../src/infrastructure/external-services/stripePaymentGateway.service';

jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        paymentIntents: {
            create: jest.fn(),
        },
        refunds: {
            create: jest.fn(),
        },
    }));
});

describe('StripePaymentGatewayService', () => {
    let service: StripePaymentGatewayService;
    const request = {
        amount: 100,
        currency: 'EUR',
        method: 'card',
        cardData: { token: 'tok_visa' },
        metadata: { orderId: 1 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.STRIPE_SECRET_KEY = 'sk_test';
        service = new StripePaymentGatewayService();
    });

    it('processPayment retourne success si Stripe succeed', async () => {
        const paymentIntent = { status: 'succeeded', id: 'pi_1', latest_charge: 'ch_1', amount: 10000, currency: 'eur', payment_method: 'pm_1' };
        service['stripe'].paymentIntents.create.mockResolvedValue(paymentIntent);
        const res = await service.processPayment(request as any);
        expect(res.success).toBe(true);
        expect(res.providerId).toBe('pi_1');
    });

    it('processPayment retourne requires_action', async () => {
        const paymentIntent = { status: 'requires_action', next_action: {}, client_secret: 'secret' };
        service['stripe'].paymentIntents.create.mockResolvedValue(paymentIntent);
        const res = await service.processPayment(request as any);
        expect(res.success).toBe(false);
        expect(res.errorCode).toBe('requires_action');
    });

    it('processPayment retourne payment_failed', async () => {
        const paymentIntent = { status: 'failed', last_payment_error: 'err' };
        service['stripe'].paymentIntents.create.mockResolvedValue(paymentIntent);
        const res = await service.processPayment(request as any);
        expect(res.success).toBe(false);
        expect(res.errorCode).toBe('payment_failed');
    });

    it('refundPayment retourne success', async () => {
        const refund = { id: 're_1', status: 'succeeded', amount: 10000, currency: 'eur' };
        service['stripe'].refunds.create.mockResolvedValue(refund);
        const res = await service.refundPayment('pi_1', 100);
        expect(res.success).toBe(true);
        expect(res.providerId).toBe('re_1');
    });

    it('processPayment retourne simulation si pas de stripe', async () => {
        service['stripe'] = null;
        const res = await service.processPayment(request as any);
        expect(res.details.method).toContain('simulation');
    });

    it('refundPayment retourne simulation si pas de stripe', async () => {
        service['stripe'] = null;
        const res = await service.refundPayment('pi_1', 100);
        expect(res.details.method).toContain('simulation');
    });

    it('processPayment gère les erreurs', async () => {
        service['stripe'].paymentIntents.create.mockRejectedValue(new Error('fail'));
        const res = await service.processPayment(request as any);
        expect(res.success).toBe(false);
        expect(res.errorMessage).toBeDefined();
    });

    it('refundPayment gère les erreurs', async () => {
        service['stripe'].refunds.create.mockRejectedValue(new Error('fail'));
        const res = await service.refundPayment('pi_1', 100);
        expect(res.success).toBe(false);
        expect(res.errorMessage).toBeDefined();
    });
}); 
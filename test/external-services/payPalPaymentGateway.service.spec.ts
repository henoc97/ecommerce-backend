import { PayPalPaymentGatewayService } from '../../src/infrastructure/external-services/payPalPaymentGateway.service';

jest.mock('@paypal/checkout-server-sdk', () => {
    const orders = {
        OrdersCreateRequest: jest.fn().mockImplementation(() => ({
            prefer: jest.fn(),
            requestBody: jest.fn(),
        })),
        OrdersCaptureRequest: jest.fn().mockImplementation(() => ({})),
    };
    const payments = {
        CapturesRefundRequest: jest.fn().mockImplementation(() => ({ requestBody: jest.fn() })),
    };
    const core = {
        PayPalHttpClient: jest.fn().mockImplementation(() => ({
            execute: jest.fn(),
        })),
        SandboxEnvironment: jest.fn(),
        LiveEnvironment: jest.fn(),
    };
    return { orders, payments, core };
});

describe('PayPalPaymentGatewayService', () => {
    let service: PayPalPaymentGatewayService;
    const request = {
        amount: 100,
        currency: 'EUR',
        method: 'paypal',
        metadata: { orderId: 1 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.PAYPAL_CLIENT_ID = 'id';
        process.env.PAYPAL_CLIENT_SECRET = 'secret';
        service = new PayPalPaymentGatewayService();
        service['paypalClient'] = {
            execute: jest.fn(),
        };
    });

    it('processPayment retourne success si PayPal COMPLETED', async () => {
        service['paypalClient'].execute.mockResolvedValue({ result: { status: 'COMPLETED', id: 'order_1', purchase_units: [{ payments: { captures: [{ id: 'cap_1' }] } }] } });
        const res = await service.processPayment(request as any);
        expect(res.success).toBe(true);
        expect(res.providerId).toBe('order_1');
    });

    it('processPayment capture si APPROVED', async () => {
        service['paypalClient'].execute
            .mockResolvedValueOnce({ result: { status: 'APPROVED', id: 'order_2' } })
            .mockResolvedValueOnce({ result: { status: 'COMPLETED', id: 'order_2', purchase_units: [{ payments: { captures: [{ id: 'cap_2' }] } }] } });
        const res = await service.processPayment(request as any);
        expect(res.success).toBe(true);
        expect(res.providerId).toBe('order_2');
    });

    it('processPayment retourne erreur si order not completed', async () => {
        service['paypalClient'].execute.mockResolvedValue({ result: { status: 'FAILED', id: 'order_3' } });
        const res = await service.processPayment(request as any);
        expect(res.success).toBe(false);
        expect(res.errorCode).toBe('order_not_completed');
    });

    it('refundPayment retourne success', async () => {
        service['paypalClient'].execute.mockResolvedValue({ result: { id: 'ref_1', status: 'COMPLETED' } });
        const res = await service.refundPayment('cap_1', 100);
        expect(res.success).toBe(true);
        expect(res.providerId).toBe('ref_1');
    });

    it('processPayment retourne simulation si pas de paypalClient', async () => {
        service['paypalClient'] = null;
        const res = await service.processPayment(request as any);
        expect(res.details.method).toContain('simulation');
    });

    it('refundPayment retourne simulation si pas de paypalClient', async () => {
        service['paypalClient'] = null;
        const res = await service.refundPayment('cap_1', 100);
        expect(res.details.method).toContain('simulation');
    });

    it('processPayment gère les erreurs', async () => {
        service['paypalClient'].execute.mockRejectedValue(new Error('fail'));
        const res = await service.processPayment(request as any);
        expect(res.success).toBe(false);
        expect(res.errorMessage).toBeDefined();
    });

    it('refundPayment gère les erreurs', async () => {
        service['paypalClient'].execute.mockRejectedValue(new Error('fail'));
        const res = await service.refundPayment('cap_1', 100);
        expect(res.success).toBe(false);
        expect(res.errorMessage).toBeDefined();
    });
}); 
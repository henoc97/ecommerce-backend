import { ProcessPaymentUseCase } from '../../src/application/use-cases/payment.use-case/ProcessPayment.use-case';
describe('ProcessPaymentUseCase', () => {
    let useCase: ProcessPaymentUseCase;
    let paymentGatewayFactory: any;
    let paymentService: any;
    let orderService: any;

    beforeEach(() => {
        paymentGatewayFactory = { getService: jest.fn() };
        paymentService = { createPayment: jest.fn() };
        orderService = { findById: jest.fn(), updateOrder: jest.fn() };
        useCase = new ProcessPaymentUseCase(orderService, paymentService, paymentGatewayFactory);
    });

    it('doit traiter un paiement', async () => {
        orderService.findById.mockResolvedValue({ id: 1, userId: 2, status: 'PENDING' });
        const gateway = { processPayment: jest.fn().mockResolvedValue({ success: true, providerId: 'pid' }) };
        paymentGatewayFactory.getService.mockReturnValue(gateway);
        paymentService.createPayment.mockResolvedValue({ id: 1 });
        orderService.updateOrder.mockResolvedValue(undefined);
        const dto = { orderId: 1, method: 'card', amount: 100, currency: 'EUR' };
        const result = await useCase.execute(2, dto);
        expect(orderService.findById).toHaveBeenCalledWith(1);
        expect(paymentGatewayFactory.getService).toHaveBeenCalledWith('card');
        expect(gateway.processPayment).toHaveBeenCalled();
        expect(paymentService.createPayment).toHaveBeenCalled();
        expect(orderService.updateOrder).toHaveBeenCalled();
        expect(result).toBeDefined();
    });

    it('doit retourner une erreur si la commande est introuvable', async () => {
        orderService.findById.mockResolvedValue(null);
        const dto = { orderId: 1, method: 'card', amount: 100, currency: 'EUR' };
        const result = await useCase.execute(2, dto);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Commande introuvable');
    });

    it('doit retourner une erreur si la commande est déjà traitée', async () => {
        orderService.findById.mockResolvedValue({ id: 1, userId: 2, status: 'COMPLETED' });
        const dto = { orderId: 1, method: 'card', amount: 100, currency: 'EUR' };
        const result = await useCase.execute(2, dto);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Commande déjà traitée');
    });

    it('doit retourner une erreur si la gateway refuse le paiement', async () => {
        orderService.findById.mockResolvedValue({ id: 1, userId: 2, status: 'PENDING' });
        const gateway = { processPayment: jest.fn().mockResolvedValue({ success: false, details: { reason: 'refusé' } }) };
        paymentGatewayFactory.getService.mockReturnValue(gateway);
        paymentService.createPayment.mockResolvedValue({ id: 1 });
        orderService.updateOrder.mockResolvedValue(undefined);
        const dto = { orderId: 1, method: 'card', amount: 100, currency: 'EUR' };
        const result = await useCase.execute(2, dto);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Paiement refusé');
    });
}); 
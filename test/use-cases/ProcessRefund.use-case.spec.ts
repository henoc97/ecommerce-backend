import { ProcessRefundUseCase } from '../../src/application/use-cases/payment.use-case/ProcessRefund.use-case';
describe('ProcessRefundUseCase', () => {
    let useCase: ProcessRefundUseCase;
    let refundService: any;
    let orderService: any;
    let paymentGatewayFactory: any;

    beforeEach(() => {
        refundService = { createRefund: jest.fn(), findById: jest.fn(), updateRefund: jest.fn() };
        orderService = { getOrderPayment: jest.fn(), findById: jest.fn(), updateOrder: jest.fn() };
        paymentGatewayFactory = { getService: jest.fn() };
        useCase = new ProcessRefundUseCase(refundService, orderService, paymentGatewayFactory);
    });

    it('doit créer une demande de remboursement', async () => {
        orderService.getOrderPayment.mockResolvedValue({ orderId: 1, amount: 100, status: 'SUCCESS' });
        orderService.findById.mockResolvedValue({ userId: 2 });
        refundService.createRefund.mockResolvedValue({ id: 1 });
        const dto = { orderId: 1, amount: 50, reason: 'test' };
        const result = await useCase.execute(2, dto);
        expect(orderService.getOrderPayment).toHaveBeenCalledWith(1);
        expect(orderService.findById).toHaveBeenCalledWith(1);
        expect(refundService.createRefund).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.refundId).toBe(1);
    });

    it('doit retourner une erreur si le paiement est introuvable', async () => {
        orderService.getOrderPayment.mockResolvedValue(null);
        const dto = { orderId: 1, amount: 50, reason: 'test' };
        const result = await useCase.execute(2, dto);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Paiement introuvable');
    });

    it('doit retourner une erreur si accès non autorisé', async () => {
        orderService.getOrderPayment.mockResolvedValue({ orderId: 1, amount: 100, status: 'SUCCESS' });
        orderService.findById.mockResolvedValue({ userId: 99 });
        const dto = { orderId: 1, amount: 50, reason: 'test' };
        const result = await useCase.execute(2, dto);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Accès non autorisé à ce paiement');
    });

    it('doit retourner une erreur si le paiement n\'est pas SUCCESS', async () => {
        orderService.getOrderPayment.mockResolvedValue({ orderId: 1, amount: 100, status: 'FAILED' });
        orderService.findById.mockResolvedValue({ userId: 2 });
        const dto = { orderId: 1, amount: 50, reason: 'test' };
        const result = await useCase.execute(2, dto);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Le paiement doit être en statut SUCCESS pour être remboursé');
    });

    it('doit retourner une erreur si le montant de remboursement est trop élevé', async () => {
        orderService.getOrderPayment.mockResolvedValue({ orderId: 1, amount: 100, status: 'SUCCESS' });
        orderService.findById.mockResolvedValue({ userId: 2 });
        const dto = { orderId: 1, amount: 150, reason: 'test' };
        const result = await useCase.execute(2, dto);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Le montant de remboursement ne peut pas dépasser le montant du paiement');
    });
}); 
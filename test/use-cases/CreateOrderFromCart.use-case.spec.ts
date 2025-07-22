import { CreateOrderFromCartUseCase } from '../../src/application/use-cases/order.use-case/CreateOrderFromCart.use-case';
describe('CreateOrderFromCartUseCase', () => {
    let useCase: CreateOrderFromCartUseCase;
    let cartService: any;
    let cartItemService: any;
    let productVariantService: any;
    let orderService: any;
    let orderItemService: any;
    let promotionService: any;

    beforeEach(() => {
        cartService = { findByUserIdAndShopId: jest.fn(), getCartItems: jest.fn(), deleteCart: jest.fn() };
        cartItemService = { listItemsByCart: jest.fn(), deleteItem: jest.fn() };
        productVariantService = { findById: jest.fn(), setStock: jest.fn() };
        orderService = { createOrder: jest.fn(), updateOrder: jest.fn() };
        orderItemService = { addOrderItem: jest.fn(), listItemsByOrder: jest.fn() };
        promotionService = { getVariantPromotions: jest.fn() };
        useCase = new CreateOrderFromCartUseCase(
            cartService,
            cartItemService,
            productVariantService,
            orderService,
            orderItemService,
            promotionService
        );
    });

    it('doit créer une commande à partir du panier', async () => {
        cartService.findByUserIdAndShopId.mockResolvedValue({ id: 1, totalPrice: 100 });
        cartService.getCartItems.mockResolvedValue([{ id: 2, productVariantId: 3, quantity: 1 }]);
        productVariantService.findById.mockResolvedValue({ id: 3, price: 50, stock: 10 });
        promotionService.getVariantPromotions.mockResolvedValue([]);
        orderService.createOrder.mockResolvedValue({ id: 4 });
        orderItemService.addOrderItem.mockResolvedValue({});
        orderItemService.listItemsByOrder.mockResolvedValue([{ price: 50, quantity: 2 }]);
        cartItemService.listItemsByCart.mockResolvedValue([{ id: 2 }]);
        cartItemService.deleteItem.mockResolvedValue(undefined);
        cartService.deleteCart.mockResolvedValue(undefined);
        orderService.updateOrder.mockResolvedValue(undefined);
        const result = await useCase.execute(1, 1);
        expect(cartService.findByUserIdAndShopId).toHaveBeenCalled();
        expect(cartService.getCartItems).toHaveBeenCalled();
        expect(orderService.createOrder).toHaveBeenCalled();
        expect(result).toBeDefined();
    });

    it('doit retourner une erreur si le panier est vide', async () => {
        cartService.findByUserIdAndShopId.mockResolvedValue(null);
        const result = await useCase.execute(1, 1);
        expect(result).toEqual({ error: 'Panier vide' });
    });

    it('doit retourner une erreur si le panier n\'a pas d\'items', async () => {
        cartService.findByUserIdAndShopId.mockResolvedValue({ id: 1, totalPrice: 100 });
        cartService.getCartItems.mockResolvedValue([]);
        const result = await useCase.execute(1, 1);
        expect(result).toEqual({ error: 'Panier vide' });
    });

    it('doit retourner une erreur si un item a un stock insuffisant', async () => {
        cartService.findByUserIdAndShopId.mockResolvedValue({ id: 1, totalPrice: 100 });
        cartService.getCartItems.mockResolvedValue([{ id: 2, productVariantId: 3, quantity: 5 }]);
        productVariantService.findById.mockResolvedValue({ id: 3, price: 50, stock: 2 });
        promotionService.getVariantPromotions.mockResolvedValue([]);
        const result = await useCase.execute(1, 1);
        expect(result.error).toBe('Erreur de disponibilité');
    });
}); 
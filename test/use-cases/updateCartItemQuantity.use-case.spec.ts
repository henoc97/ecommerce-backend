import { UpdateCartItemQuantityUseCase } from '../../src/application/use-cases/cart.use-case/updateCartItemQuantity.use-case';
describe('UpdateCartItemQuantityUseCase', () => {
    let useCase: UpdateCartItemQuantityUseCase;
    let cartItemService: any;
    let productVariantService: any;
    let cartService: any;

    beforeEach(() => {
        cartItemService = { updateItemQuantity: jest.fn(), findById: jest.fn() };
        productVariantService = { findById: jest.fn() };
        cartService = { updateCartTotals: jest.fn() };
        useCase = new UpdateCartItemQuantityUseCase(productVariantService, cartService, cartItemService);
    });

    it('doit mettre à jour la quantité d\'un item', async () => {
        cartItemService.findById.mockResolvedValue({ id: 1, productVariantId: 2, cartId: 3 });
        productVariantService.findById.mockResolvedValue({ stock: 10 });
        cartItemService.updateItemQuantity.mockResolvedValue({ id: 1, quantity: 2 });
        const result = await useCase.execute(1, 2);
        expect(cartItemService.updateItemQuantity).toHaveBeenCalledWith(1, 2);
        expect(result).toEqual({ id: 1, quantity: 2 });
    });

    it('doit retourner "not_found" si l\'item n\'existe pas', async () => {
        cartItemService.findById.mockResolvedValue(null);
        const result = await useCase.execute(1, 2);
        expect(result).toBe('not_found');
    });

    it('doit lever une erreur si la variante est introuvable', async () => {
        cartItemService.findById.mockResolvedValue({ id: 1, productVariantId: 2, cartId: 3 });
        productVariantService.findById.mockResolvedValue(null);
        await expect(useCase.execute(1, 2)).rejects.toThrow('Variante de produit introuvable');
    });

    it('doit retourner "stock" si le stock est insuffisant', async () => {
        cartItemService.findById.mockResolvedValue({ id: 1, productVariantId: 2, cartId: 3 });
        productVariantService.findById.mockResolvedValue({ stock: 1 });
        const result = await useCase.execute(1, 2);
        expect(result).toBe('stock');
    });
}); 
import { AddProductToCartUseCase } from '../../src/application/use-cases/cart.use-case/addProductToCart.use-case';
describe('AddProductToCartUseCase', () => {
    let useCase: AddProductToCartUseCase;
    let cartService: any;
    let productService: any;
    let productVariantService: any;
    let cartItemService: any;

    beforeEach(() => {
        cartService = { findByUserIdAndShopId: jest.fn(), createCart: jest.fn(), updateCartTotals: jest.fn() };
        productService = { findById: jest.fn() };
        productVariantService = { findById: jest.fn() };
        cartItemService = { addItem: jest.fn(), findByCartIdAndProductId: jest.fn() };
        useCase = new AddProductToCartUseCase(cartService, productVariantService, productService, cartItemService);
    });

    it('doit ajouter un produit au panier existant', async () => {
        productVariantService.findById.mockResolvedValue({ productId: 2, stock: 10 });
        productService.findById.mockResolvedValue({ id: 2, shopId: 1 });
        cartService.findByUserIdAndShopId.mockResolvedValue({ id: 1 });
        cartItemService.findByCartIdAndProductId.mockResolvedValue(null);
        cartItemService.addItem.mockResolvedValue({ id: 3 });
        const result = await useCase.execute(1, 5, 2);
        expect(productVariantService.findById).toHaveBeenCalled();
        expect(productService.findById).toHaveBeenCalled();
        expect(cartService.findByUserIdAndShopId).toHaveBeenCalled();
        expect(cartItemService.addItem).toHaveBeenCalled();
        expect(result).toBeDefined();
    });

    it('doit lever une erreur si la variante est introuvable', async () => {
        productVariantService.findById.mockResolvedValue(null);
        await expect(useCase.execute(1, 5, 2)).rejects.toThrow('Variante de produit introuvable');
    });

    it('doit lever une erreur si le produit est introuvable', async () => {
        productVariantService.findById.mockResolvedValue({ productId: 2, stock: 10 });
        productService.findById.mockResolvedValue(null);
        await expect(useCase.execute(1, 5, 2)).rejects.toThrow('Produit introuvable');
    });

    it('doit retourner "conflict" si le produit est déjà dans le panier', async () => {
        productVariantService.findById.mockResolvedValue({ productId: 2, stock: 10 });
        productService.findById.mockResolvedValue({ id: 2, shopId: 1 });
        cartService.findByUserIdAndShopId.mockResolvedValue({ id: 1 });
        cartItemService.findByCartIdAndProductId.mockResolvedValue({ id: 99 });
        const result = await useCase.execute(1, 5, 2);
        expect(result).toBe('conflict');
    });

    it('doit retourner "stock" si le stock est insuffisant', async () => {
        productVariantService.findById.mockResolvedValue({ productId: 2, stock: 1 });
        productService.findById.mockResolvedValue({ id: 2, shopId: 1 });
        cartService.findByUserIdAndShopId.mockResolvedValue({ id: 1 });
        cartItemService.findByCartIdAndProductId.mockResolvedValue(null);
        const result = await useCase.execute(1, 5, 2);
        expect(result).toBe('stock');
    });
}); 
import { CreatePromotionUseCase } from '../../src/application/use-cases/promotion.use-case/CreatePromotion.use-case';
import { DiscountType } from '../../src/domain/enums/DiscountType.enum';
describe('CreatePromotionUseCase', () => {
    let useCase: CreatePromotionUseCase;
    let promotionService: any;
    let productVariantService: any;
    let productService: any;
    let vendorService: any;

    beforeEach(() => {
        promotionService = { createPromotion: jest.fn() };
        productVariantService = { findById: jest.fn() };
        productService = { findById: jest.fn() };
        vendorService = { findByUserId: jest.fn() };
        useCase = new CreatePromotionUseCase(promotionService, productVariantService, productService, vendorService);
    });

    it('doit créer une promotion', async () => {
        vendorService.findByUserId.mockResolvedValue({ id: 1 });
        productVariantService.findById.mockResolvedValue({ id: 1, productId: 2 });
        productService.findById.mockResolvedValue({ id: 2, shop: { vendorId: 1 } });
        promotionService.createPromotion.mockResolvedValue({ id: 2 });
        const dto = { productVariantId: 1, name: 'Promo', discountValue: 10, discountType: DiscountType.PERCENTAGE, startDate: new Date(), endDate: new Date() };
        const result = await useCase.execute(dto, 1);
        expect(vendorService.findByUserId).toHaveBeenCalledWith(1);
        expect(productVariantService.findById).toHaveBeenCalledWith(1);
        expect(productService.findById).toHaveBeenCalledWith(2);
        expect(promotionService.createPromotion).toHaveBeenCalled();
        expect(result).toBeDefined();
    });

    it('doit lever une erreur si le vendeur est introuvable', async () => {
        vendorService.findByUserId.mockResolvedValue(null);
        const dto = { productVariantId: 1, name: 'Promo', discountValue: 10, discountType: DiscountType.PERCENTAGE, startDate: new Date(), endDate: new Date() };
        await expect(useCase.execute(dto, 1)).rejects.toThrow('Vendeur non trouvé');
    });

    it('doit lever une erreur si la variante est introuvable', async () => {
        vendorService.findByUserId.mockResolvedValue({ id: 1 });
        productVariantService.findById.mockResolvedValue(null);
        const dto = { productVariantId: 1, name: 'Promo', discountValue: 10, discountType: DiscountType.PERCENTAGE, startDate: new Date(), endDate: new Date() };
        await expect(useCase.execute(dto, 1)).rejects.toThrow('Variante introuvable');
    });

    it('doit lever une erreur si accès interdit à la variante', async () => {
        vendorService.findByUserId.mockResolvedValue({ id: 1 });
        productVariantService.findById.mockResolvedValue({ id: 1, productId: 2 });
        productService.findById.mockResolvedValue({ id: 2, shop: { vendorId: 99 } });
        const dto = { productVariantId: 1, name: 'Promo', discountValue: 10, discountType: DiscountType.PERCENTAGE, startDate: new Date(), endDate: new Date() };
        await expect(useCase.execute(dto, 1)).rejects.toThrow('Accès interdit à la variante');
    });

    it('doit lever une erreur si le produit est introuvable', async () => {
        vendorService.findByUserId.mockResolvedValue({ id: 1 });
        const dto = { productId: 2, name: 'Promo', discountValue: 10, discountType: DiscountType.PERCENTAGE, startDate: new Date(), endDate: new Date() };
        productService.findById.mockResolvedValue(null);
        await expect(useCase.execute(dto, 1)).rejects.toThrow('Accès interdit au produit');
    });

    it('doit lever une erreur si accès interdit au produit', async () => {
        vendorService.findByUserId.mockResolvedValue({ id: 1 });
        productService.findById.mockResolvedValue({ id: 2, shop: { vendorId: 99 } });
        const dto = { productId: 2, name: 'Promo', discountValue: 10, discountType: DiscountType.PERCENTAGE, startDate: new Date(), endDate: new Date() };
        await expect(useCase.execute(dto, 1)).rejects.toThrow('Accès interdit au produit');
    });

    it('doit lever une erreur si aucune cible de promotion n\'est fournie', async () => {
        vendorService.findByUserId.mockResolvedValue({ id: 1 });
        const dto = { name: 'Promo', discountValue: 10, discountType: DiscountType.PERCENTAGE, startDate: new Date(), endDate: new Date() };
        await expect(useCase.execute(dto, 1)).rejects.toThrow('Aucune cible de promotion fournie');
    });
}); 
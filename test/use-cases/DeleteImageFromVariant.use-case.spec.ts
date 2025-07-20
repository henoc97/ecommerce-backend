import { DeleteImageFromVariantUseCase } from '../../src/application/use-cases/product-variant.use-case/DeleteImageFromVariant.use-case';
describe('DeleteImageFromVariantUseCase', () => {
    let useCase: DeleteImageFromVariantUseCase;
    let productVariantService: any;
    let productService: any;
    let vendorService: any;
    let productImageService: any;
    let cloudinaryService: any;

    beforeEach(() => {
        productVariantService = { findById: jest.fn() };
        productService = { findById: jest.fn() };
        vendorService = { findByUserId: jest.fn() };
        productImageService = { listImagesByVariant: jest.fn(), deleteImage: jest.fn() };
        cloudinaryService = { deleteImage: jest.fn() };
        useCase = new DeleteImageFromVariantUseCase(productVariantService, productService, vendorService, productImageService, cloudinaryService);
    });

    it('doit supprimer une image d\'une variante', async () => {
        productVariantService.findById.mockResolvedValue({ id: 1, productId: 2 });
        productService.findById.mockResolvedValue({ id: 2, shop: { vendorId: 3 } });
        vendorService.findByUserId.mockResolvedValue({ id: 3 });
        productImageService.listImagesByVariant.mockResolvedValue([{ id: 4, url: 'url' }]);
        cloudinaryService.deleteImage.mockResolvedValue(undefined);
        productImageService.deleteImage.mockResolvedValue(undefined);
        await useCase.execute(1, 4, { id: 3 });
        expect(productVariantService.findById).toHaveBeenCalledWith(1);
        expect(productService.findById).toHaveBeenCalledWith(2);
        expect(vendorService.findByUserId).toHaveBeenCalledWith(3);
        expect(productImageService.listImagesByVariant).toHaveBeenCalledWith(1);
        expect(cloudinaryService.deleteImage).toHaveBeenCalledWith('url');
        expect(productImageService.deleteImage).toHaveBeenCalledWith(4);
    });

    it('doit lever NotFoundException si la variante est introuvable', async () => {
        productVariantService.findById.mockResolvedValue(null);
        await expect(useCase.execute(1, 4, { id: 3 })).rejects.toThrow('Variante introuvable');
    });

    it('doit lever NotFoundException si le produit est introuvable', async () => {
        productVariantService.findById.mockResolvedValue({ id: 1, productId: 2 });
        productService.findById.mockResolvedValue(null);
        await expect(useCase.execute(1, 4, { id: 3 })).rejects.toThrow('Accès interdit : cette variante ne vous appartient pas');
    });

    it('doit lever ForbiddenException si le vendeur n\'a pas accès', async () => {
        productVariantService.findById.mockResolvedValue({ id: 1, productId: 2 });
        productService.findById.mockResolvedValue({ id: 2, shop: { vendorId: 99 } });
        vendorService.findByUserId.mockResolvedValue({ id: 3 });
        await expect(useCase.execute(1, 4, { id: 3 })).rejects.toThrow('Accès interdit');
    });

    it('doit lever NotFoundException si l\'image est introuvable', async () => {
        productVariantService.findById.mockResolvedValue({ id: 1, productId: 2 });
        productService.findById.mockResolvedValue({ id: 2, shop: { vendorId: 3 } });
        vendorService.findByUserId.mockResolvedValue({ id: 3 });
        productImageService.listImagesByVariant.mockResolvedValue([]);
        await expect(useCase.execute(1, 4, { id: 3 })).rejects.toThrow('Image introuvable');
    });

    it('doit propager l\'erreur si Cloudinary échoue', async () => {
        productVariantService.findById.mockResolvedValue({ id: 1, productId: 2 });
        productService.findById.mockResolvedValue({ id: 2, shop: { vendorId: 3 } });
        vendorService.findByUserId.mockResolvedValue({ id: 3 });
        productImageService.listImagesByVariant.mockResolvedValue([{ id: 4, url: 'url' }]);
        cloudinaryService.deleteImage.mockRejectedValue(new Error('Cloudinary fail'));
        await expect(useCase.execute(1, 4, { id: 3 })).rejects.toThrow('Cloudinary fail');
    });
}); 
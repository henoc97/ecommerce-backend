import { AddImageToVariantUseCase } from '../../src/application/use-cases/product-variant.use-case/AddImageToVariant.use-case';
describe('AddImageToVariantUseCase', () => {
    let useCase: AddImageToVariantUseCase;
    let productVariantService: any;
    let productService: any;
    let vendorService: any;
    let productImageService: any;
    let cloudinaryService: any;

    beforeEach(() => {
        productVariantService = { findById: jest.fn() };
        productService = { findById: jest.fn() };
        vendorService = { findByUserId: jest.fn() };
        productImageService = { addImage: jest.fn() };
        cloudinaryService = { uploadImage: jest.fn() };
        useCase = new AddImageToVariantUseCase(productVariantService, productService, vendorService, productImageService, cloudinaryService);
    });

    it('doit ajouter une image à une variante', async () => {
        productVariantService.findById.mockResolvedValue({ id: 1, productId: 2 });
        productService.findById.mockResolvedValue({ id: 2, shop: { vendorId: 3 } });
        vendorService.findByUserId.mockResolvedValue({ id: 3 });
        cloudinaryService.uploadImage.mockResolvedValue('url');
        productImageService.addImage.mockResolvedValue(undefined);
        const result = await useCase.execute(1, Buffer.from('test'), 'img.png', { id: 3 });
        expect(productVariantService.findById).toHaveBeenCalledWith(1);
        expect(productService.findById).toHaveBeenCalledWith(2);
        expect(vendorService.findByUserId).toHaveBeenCalledWith(3);
        expect(cloudinaryService.uploadImage).toHaveBeenCalled();
        expect(productImageService.addImage).toHaveBeenCalledWith(1, 'url');
        expect(result).toEqual({ url: 'url' });
    });

    it('doit lever NotFoundException si la variante est introuvable', async () => {
        productVariantService.findById.mockResolvedValue(null);
        await expect(useCase.execute(1, Buffer.from('test'), 'img.png', { id: 3 })).rejects.toThrow('Variante introuvable');
    });

    it('doit lever NotFoundException si le produit est introuvable', async () => {
        productVariantService.findById.mockResolvedValue({ id: 1, productId: 2 });
        productService.findById.mockResolvedValue(null);
        await expect(useCase.execute(1, Buffer.from('test'), 'img.png', { id: 3 })).rejects.toThrow('Accès interdit : cette variante ne vous appartient pas');
    });

    it('doit lever ForbiddenException si le vendeur n\'a pas accès', async () => {
        productVariantService.findById.mockResolvedValue({ id: 1, productId: 2 });
        productService.findById.mockResolvedValue({ id: 2, shop: { vendorId: 99 } });
        vendorService.findByUserId.mockResolvedValue({ id: 3 });
        await expect(useCase.execute(1, Buffer.from('test'), 'img.png', { id: 3 })).rejects.toThrow('Accès interdit');
    });

    it('doit propager l\'erreur si Cloudinary échoue', async () => {
        productVariantService.findById.mockResolvedValue({ id: 1, productId: 2 });
        productService.findById.mockResolvedValue({ id: 2, shop: { vendorId: 3 } });
        vendorService.findByUserId.mockResolvedValue({ id: 3 });
        cloudinaryService.uploadImage.mockRejectedValue(new Error('Cloudinary fail'));
        await expect(useCase.execute(1, Buffer.from('test'), 'img.png', { id: 3 })).rejects.toThrow('Cloudinary fail');
    });
}); 
import { Test, TestingModule } from '@nestjs/testing';
import { PromotionService } from '../../src/application/services/promotion.service';
import { PromotionPrismaRepository } from '../../src/infrastructure/impl.repositories/PromotionPrisma.repository';

describe('PromotionService', () => {
    let service: PromotionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PromotionService,
                {
                    provide: PromotionPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<PromotionService>(PromotionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

describe('PromotionService - Méthodes métiers', () => {
    let service: PromotionService;
    let repository: any;
    let logger: any;

    beforeEach(async () => {
        repository = {
            findPromotionWithOwnership: jest.fn(),
            updatePromotion: jest.fn(),
        };
        logger = { info: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PromotionService,
                { provide: PromotionPrismaRepository, useValue: repository },
            ],
        }).compile();
        service = module.get<PromotionService>(PromotionService);
        (global as any).logger = logger; // pour logger.info
    });

    it('doit lever Forbidden si ownership KO', async () => {
        repository.findPromotionWithOwnership.mockResolvedValue({ productVariant: { product: { shop: { vendor: { userId: 2 } } } } });
        await expect(service.updatePromotion(1, {}, 1)).rejects.toThrow('Forbidden');
    });

    it('doit appeler updatePromotion avec les bons champs', async () => {
        repository.findPromotionWithOwnership.mockResolvedValue({ productVariant: { product: { shop: { vendor: { userId: 1 } } } } });
        const dto = { name: 'promo', discountValue: 10, discountType: 'PERCENT', startDate: '2024-01-01', endDate: '2024-01-02' };
        await service.updatePromotion(1, dto as any, 1);
        expect(repository.updatePromotion).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'promo', discountValue: 10, discountType: 'PERCENT' }));
    });
}); 
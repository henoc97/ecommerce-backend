import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../../src/application/services/analytics.service';
import { OrderPrismaRepository } from '../../src/infrastructure/impl.repositories/OrderPrisma.repository';

describe('AnalyticsService', () => {
    let service: AnalyticsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AnalyticsService,
                { provide: OrderPrismaRepository, useValue: {} },
            ],
        }).compile();
        service = module.get<AnalyticsService>(AnalyticsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

describe('AnalyticsService - Méthodes métiers', () => {
    let service: AnalyticsService;
    let orderRepository: any;

    beforeEach(async () => {
        orderRepository = {
            getTopSellers: jest.fn(),
            getTopProducts: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AnalyticsService,
                { provide: OrderPrismaRepository, useValue: orderRepository },
            ],
        }).compile();
        service = module.get<AnalyticsService>(AnalyticsService);
    });

    it('doit appeler getTopSellers de la repo', async () => {
        orderRepository.getTopSellers.mockResolvedValue(['a']);
        const result = await service.getTopSellers();
        expect(orderRepository.getTopSellers).toHaveBeenCalled();
        expect(result).toEqual(['a']);
    });

    it('doit loguer et propager l\'erreur de getTopProducts', async () => {
        orderRepository.getTopProducts.mockRejectedValue(new Error('fail'));
        await expect(service.getTopProducts()).rejects.toThrow('fail');
    });
});
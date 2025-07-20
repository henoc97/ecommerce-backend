import { Test, TestingModule } from '@nestjs/testing';
import { ShopSubscriptionService } from '../../src/application/services/shopsubscription.service';
import { ShopSubscriptionPrismaRepository } from '../../src/infrastructure/impl.repositories/ShopSubscriptionPrisma.repository';

describe('ShopSubscriptionService', () => {
    let service: ShopSubscriptionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShopSubscriptionService,
                {
                    provide: ShopSubscriptionPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<ShopSubscriptionService>(ShopSubscriptionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
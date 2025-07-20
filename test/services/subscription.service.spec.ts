import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from '../../src/application/services/subscription.service';
import { SubscriptionPrismaRepository } from '../../src/infrastructure/impl.repositories/SubscriptionPrisma.repository';

describe('SubscriptionService', () => {
    let service: SubscriptionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubscriptionService,
                {
                    provide: SubscriptionPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<SubscriptionService>(SubscriptionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
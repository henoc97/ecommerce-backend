import { Test, TestingModule } from '@nestjs/testing';
import { RefundService } from '../../src/application/services/refund.service';
import { RefundPrismaRepository } from '../../src/infrastructure/impl.repositories/RefundPrisma.repository';

describe('RefundService', () => {
    let service: RefundService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RefundService,
                {
                    provide: RefundPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<RefundService>(RefundService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
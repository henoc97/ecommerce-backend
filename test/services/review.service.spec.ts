import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from '../../src/application/services/review.service';
import { ReviewPrismaRepository } from '../../src/infrastructure/impl.repositories/ReviewPrisma.repository';

describe('ReviewService', () => {
    let service: ReviewService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewService,
                {
                    provide: ReviewPrismaRepository,
                    useValue: {}, // Mock des méthodes si besoin
                },
            ],
        }).compile();
        service = module.get<ReviewService>(ReviewService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
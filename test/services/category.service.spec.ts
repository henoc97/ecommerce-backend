import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../../src/application/services/category.service';
import { CategoryPrismaRepository } from '../../src/infrastructure/impl.repositories/CategoryPrisma.repository';

describe('CategoryService', () => {
    let service: CategoryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoryService,
                {
                    provide: CategoryPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<CategoryService>(CategoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
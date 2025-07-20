import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../src/application/services/product.service';
import { ProductPrismaRepository } from '../../src/infrastructure/impl.repositories/ProductPrisma.repository';

describe('ProductService', () => {
    let service: ProductService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                {
                    provide: ProductPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<ProductService>(ProductService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
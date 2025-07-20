import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariantService } from '../../src/application/services/productvariant.service';
import { ProductVariantPrismaRepository } from '../../src/infrastructure/impl.repositories/ProductVariantPrisma.repository';

describe('ProductVariantService', () => {
    let service: ProductVariantService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductVariantService,
                {
                    provide: ProductVariantPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<ProductVariantService>(ProductVariantService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
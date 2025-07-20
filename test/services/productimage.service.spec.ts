import { Test, TestingModule } from '@nestjs/testing';
import { ProductImageService } from '../../src/application/services/productimage.service';
import { ProductImagePrismaRepository } from '../../src/infrastructure/impl.repositories/ProductImagePrisma.repository';

describe('ProductImageService', () => {
    let service: ProductImageService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductImageService,
                {
                    provide: ProductImagePrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<ProductImageService>(ProductImageService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
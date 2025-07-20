import { Test, TestingModule } from '@nestjs/testing';
import { ShopService } from '../../src/application/services/shop.service';
import { ShopPrismaRepository } from '../../src/infrastructure/impl.repositories/ShopPrisma.repository';

describe('ShopService', () => {
    let service: ShopService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShopService,
                {
                    provide: ShopPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<ShopService>(ShopService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
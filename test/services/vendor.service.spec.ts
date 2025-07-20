import { Test, TestingModule } from '@nestjs/testing';
import { VendorService } from '../../src/application/services/vendor.service';
import { VendorPrismaRepository } from '../../src/infrastructure/impl.repositories/VendorPrisma.repository';

describe('VendorService', () => {
    let service: VendorService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VendorService,
                {
                    provide: VendorPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<VendorService>(VendorService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
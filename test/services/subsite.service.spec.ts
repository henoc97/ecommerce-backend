import { Test, TestingModule } from '@nestjs/testing';
import { SubsiteService } from '../../src/application/services/subsite.service';
import { SubsitePrismaRepository } from '../../src/infrastructure/impl.repositories/SubsitePrisma.repository';

describe('SubsiteService', () => {
    let service: SubsiteService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubsiteService,
                {
                    provide: SubsitePrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<SubsiteService>(SubsiteService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
import { Test, TestingModule } from '@nestjs/testing';
import { UserActivityService } from '../../src/application/services/useractivity.service';
import { UserActivityPrismaRepository } from '../../src/infrastructure/impl.repositories/UserActivityPrisma.repository';

describe('UserActivityService', () => {
    let service: UserActivityService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserActivityService,
                {
                    provide: UserActivityPrismaRepository,
                    useValue: {}, // Mock des méthodes si besoin
                },
            ],
        }).compile();
        service = module.get<UserActivityService>(UserActivityService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
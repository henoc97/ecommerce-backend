import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../../src/application/services/notification.service';
import { NotificationPrismaRepository } from '../../src/infrastructure/impl.repositories/NotificationPrisma.repository';

describe('NotificationService', () => {
    let service: NotificationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationService,
                {
                    provide: NotificationPrismaRepository,
                    useValue: {}, // Mock des méthodes si besoin
                },
            ],
        }).compile();
        service = module.get<NotificationService>(NotificationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
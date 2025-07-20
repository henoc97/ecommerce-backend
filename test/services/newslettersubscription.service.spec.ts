import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterSubscriptionService } from '../../src/application/services/newslettersubscription.service';
import { NewsletterSubscriptionPrismaRepository } from '../../src/infrastructure/impl.repositories/NewsletterSubscriptionPrisma.repository';

describe('NewsletterSubscriptionService', () => {
    let service: NewsletterSubscriptionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NewsletterSubscriptionService,
                {
                    provide: NewsletterSubscriptionPrismaRepository,
                    useValue: {}, // Mock des méthodes si besoin
                },
            ],
        }).compile();
        service = module.get<NewsletterSubscriptionService>(NewsletterSubscriptionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
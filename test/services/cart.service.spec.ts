import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '../../src/application/services/cart.service';
import { CartPrismaRepository } from '../../src/infrastructure/impl.repositories/CartPrisma.repository';

describe('CartService', () => {
    let service: CartService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartService,
                {
                    provide: CartPrismaRepository,
                    useValue: {}, // Mock des méthodes si besoin
                },
            ],
        }).compile();
        service = module.get<CartService>(CartService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
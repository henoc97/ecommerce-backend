import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../../src/application/services/order.service';
import { OrderPrismaRepository } from '../../src/infrastructure/impl.repositories/OrderPrisma.repository';

describe('OrderService', () => {
    let service: OrderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: OrderPrismaRepository,
                    useValue: {}, // Mock des méthodes si besoin
                },
            ],
        }).compile();
        service = module.get<OrderService>(OrderService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
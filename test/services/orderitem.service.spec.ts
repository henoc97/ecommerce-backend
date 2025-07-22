import { Test, TestingModule } from '@nestjs/testing';
import { OrderItemService } from '../../src/application/services/orderitem.service';
import { OrderItemPrismaRepository } from '../../src/infrastructure/impl.repositories/OrderItemPrisma.repository';

describe('OrderItemService', () => {
    let service: OrderItemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderItemService,
                {
                    provide: OrderItemPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<OrderItemService>(OrderItemService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
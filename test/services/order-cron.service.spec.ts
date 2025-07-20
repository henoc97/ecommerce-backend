import { Test, TestingModule } from '@nestjs/testing';
import { OrderCronService } from '../../src/application/services/order-cron.service';
import { OrderService } from '../../src/application/services/order.service';

describe('OrderCronService', () => {
    let service: OrderCronService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderCronService,
                { provide: OrderService, useValue: {} },
            ],
        }).compile();
        service = module.get<OrderCronService>(OrderCronService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
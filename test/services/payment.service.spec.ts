import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../src/application/services/payment.service';
import { PaymentPrismaRepository } from '../../src/infrastructure/impl.repositories/PaymentPrisma.repository';

describe('PaymentService', () => {
    let service: PaymentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                {
                    provide: PaymentPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<PaymentService>(PaymentService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
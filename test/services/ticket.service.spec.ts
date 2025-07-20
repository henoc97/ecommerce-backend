import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from '../../src/application/services/ticket.service';
import { TicketPrismaRepository } from '../../src/infrastructure/impl.repositories/TicketPrisma.repository';

describe('TicketService', () => {
    let service: TicketService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TicketService,
                {
                    provide: TicketPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<TicketService>(TicketService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
import { Test, TestingModule } from '@nestjs/testing';
import { AddressService } from '../../src/application/services/address.service';
import { AddressPrismaRepository } from '../../src/infrastructure/impl.repositories/AddressPrisma.repository';

describe('AddressService', () => {
    let service: AddressService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AddressService,
                {
                    provide: AddressPrismaRepository,
                    useValue: {}, // Mock des méthodes si besoin
                },
            ],
        }).compile();
        service = module.get<AddressService>(AddressService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
}); 
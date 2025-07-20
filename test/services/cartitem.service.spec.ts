import { Test, TestingModule } from '@nestjs/testing';
import { CartItemService } from '../../src/application/services/cartitem.service';
import { CartItemPrismaRepository } from '../../src/infrastructure/impl.repositories/CartItemPrisma.repository';

describe('CartItemService', () => {
    let service: CartItemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartItemService,
                {
                    provide: CartItemPrismaRepository,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get<CartItemService>(CartItemService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

describe('CartItemService - Méthodes métiers', () => {
    let service: CartItemService;
    let repository: any;

    beforeEach(async () => {
        repository = {
            findById: jest.fn(),
            deleteItem: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartItemService,
                { provide: CartItemPrismaRepository, useValue: repository },
            ],
        }).compile();
        service = module.get<CartItemService>(CartItemService);
    });

    it('doit retourner not_found si item absent', async () => {
        repository.findById.mockResolvedValue(null);
        const result = await service.deleteItem(1);
        expect(result).toBe('not_found');
        expect(repository.deleteItem).not.toHaveBeenCalled();
    });

    it('doit appeler deleteItem si item existe', async () => {
        repository.findById.mockResolvedValue({ id: 1 });
        await service.deleteItem(1);
        expect(repository.deleteItem).toHaveBeenCalledWith(1);
    });
}); 
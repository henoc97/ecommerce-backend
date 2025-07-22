import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/application/services/user.service';
import { UserPrismaRepository } from '../../src/infrastructure/impl.repositories/UserPrisma.repository';

describe('UserService', () => {
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserPrismaRepository,
                    useValue: {}, // Mock des méthodes si besoin
                },
            ],
        }).compile();
        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

describe('UserService - Méthodes métiers', () => {
    let service: UserService;
    let repository: any;

    beforeEach(async () => {
        repository = {
            findById: jest.fn(),
            signIn: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: UserPrismaRepository, useValue: repository },
            ],
        }).compile();
        service = module.get<UserService>(UserService);
    });

    it('doit retourner false si pas de password', async () => {
        const result = await service.validateUserPassword({}, '123');
        expect(result).toBe(false);
    });

    it('doit appeler signIn du repo', async () => {
        repository.signIn.mockResolvedValue({ id: 1 });
        const result = await service.signIn('a', 'b');
        expect(repository.signIn).toHaveBeenCalledWith('a', 'b');
        expect(result).toEqual({ id: 1 });
    });
}); 
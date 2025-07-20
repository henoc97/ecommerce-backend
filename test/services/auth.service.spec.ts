import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/application/services/auth.service';
import { UserService } from '../../src/application/services/user.service';
import { AddressService } from '../../src/application/services/address.service';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UserService, useValue: {} },
                { provide: AddressService, useValue: {} },
            ],
        }).compile();
        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

describe('AuthService - Méthodes métiers', () => {
    let service: AuthService;
    let userService: any;
    let addressService: any;

    beforeEach(async () => {
        userService = {
            createUser: jest.fn().mockResolvedValue({ id: 1, password: 'hashed', email: 'a' }),
            findByEmail: jest.fn(),
            validateUserPassword: jest.fn(),
        };
        addressService = { createAddress: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UserService, useValue: userService },
                { provide: AddressService, useValue: addressService },
            ],
        }).compile();
        service = module.get<AuthService>(AuthService);
    });

    it('doit hasher le mot de passe et créer user + adresse', async () => {
        const user = { password: '123', email: 'a' };
        const result = await service.sign(user as any);
        expect(userService.createUser).toHaveBeenCalled();
        expect(addressService.createAddress).toHaveBeenCalled();
        expect(result.id).toBe(1);
    });

    it('doit lever une erreur si credentials invalides', async () => {
        userService.findByEmail.mockResolvedValue(null);
        await expect(service.login('a', 'b')).rejects.toThrow('Invalid credentials');
        userService.findByEmail.mockResolvedValue({ password: 'hashed' });
        userService.validateUserPassword.mockResolvedValue(false);
        await expect(service.login('a', 'b')).rejects.toThrow('Invalid credentials');
    });

    it('doit retourner le user si login OK', async () => {
        userService.findByEmail.mockResolvedValue({ password: 'hashed' });
        userService.validateUserPassword.mockResolvedValue(true);
        const result = await service.login('a', 'b');
        expect(result).toBeDefined();
    });
});
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserController } from '../../src/presentation/controllers/User.controller';
import { UserService } from '../../src/application/services/user.service';
import { VendorService } from '../../src/application/services/vendor.service';
import { UserRole } from '../../src/domain/enums/UserRole.enum';
import { APP_GUARD } from '@nestjs/core';

class MockAuthGuard {
    canActivate() { return true; }
}
class MockRolesGuard {
    canActivate() { return true; }
}

const mockUserService = {
    listUsers: jest.fn().mockResolvedValue([]),
    createUser: jest.fn().mockResolvedValue({}),
    updateUser: jest.fn().mockResolvedValue({}),
    deleteUser: jest.fn().mockResolvedValue({}),
};
const mockVendorService = {
    createVendor: jest.fn().mockResolvedValue({}),
};

describe('UserController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                { provide: UserService, useValue: mockUserService },
                { provide: VendorService, useValue: mockVendorService },
                { provide: APP_GUARD, useClass: MockAuthGuard },
                { provide: APP_GUARD, useClass: MockRolesGuard },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await app.close();
    });

    it('GET /users - retourne la liste des utilisateurs', async () => {
        mockUserService.listUsers.mockResolvedValue([{ id: 1, email: 'a@b.com', role: UserRole.ADMIN }]);
        const res = await request(app.getHttpServer()).get('/users');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id: 1, email: 'a@b.com', role: UserRole.ADMIN }]);
    });

    it('POST /users - crée un utilisateur SELLER', async () => {
        const userDto = { email: 'b@b.com', password: 'pass', name: 'Bob', role: UserRole.SELLER };
        mockUserService.createUser.mockResolvedValue({ id: 2, ...userDto });
        mockVendorService.createVendor.mockResolvedValue({ id: 1, userId: 2 });
        const res = await request(app.getHttpServer()).post('/users').send(userDto);
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ userId: 2 });
        expect(mockUserService.createUser).toHaveBeenCalledWith(userDto);
        expect(mockVendorService.createVendor).toHaveBeenCalledWith(2);
    });

    it('POST /users - retourne 400 si email invalide', async () => {
        const userDto = { email: 'bad', password: 'pass', name: 'Bob', role: UserRole.SELLER };
        const res = await request(app.getHttpServer()).post('/users').send(userDto);
        expect(res.status).toBe(400);
    });

    it('POST /users - retourne 400 si rôle invalide', async () => {
        const userDto = { email: 'b@b.com', password: 'pass', name: 'Bob', role: 'FAKE' };
        const res = await request(app.getHttpServer()).post('/users').send(userDto);
        expect(res.status).toBe(400);
    });

    it('PUT /users/:id - met à jour un utilisateur', async () => {
        mockUserService.updateUser.mockResolvedValue({ id: 1, name: 'New' });
        const res = await request(app.getHttpServer()).put('/users/1').send({ name: 'New' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 1, name: 'New' });
    });

    it('PUT /users/:id - retourne 404 si utilisateur non trouvé', async () => {
        mockUserService.updateUser.mockResolvedValue(null);
        const res = await request(app.getHttpServer()).put('/users/1').send({ name: 'New' });
        expect(res.status).toBe(404);
    });
}); 
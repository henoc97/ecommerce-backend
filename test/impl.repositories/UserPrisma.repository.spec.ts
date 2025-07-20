import { UserPrismaRepository } from '../../src/infrastructure/impl.repositories/UserPrisma.repository';
import { UserEntity } from '../../src/domain/entities/User.entity';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        notification: { deleteMany: jest.fn() },
        address: { deleteMany: jest.fn() },
        cart: { deleteMany: jest.fn() },
        ticket: { deleteMany: jest.fn() },
        review: { deleteMany: jest.fn() },
        userActivity: { deleteMany: jest.fn() },
        auditLog: { deleteMany: jest.fn() },
    },
}));

describe('UserPrismaRepository', () => {
    let repo: UserPrismaRepository;
    const user: UserEntity = {
        id: 1,
        email: 'test@example.com',
        name: 'Test',
        isEmailVerified: true,
        authProvider: 'local',
        role: 'USER',
        updatedAt: new Date(),
        createdAt: new Date(),
        password: 'hashed',
    };

    beforeEach(() => {
        repo = new UserPrismaRepository();
        jest.clearAllMocks();
    });

    it('createUser crée un utilisateur', async () => {
        (prisma.user.create as jest.Mock).mockResolvedValue(user);
        const result = await repo.createUser(user);
        expect(prisma.user.create).toHaveBeenCalledWith({ data: user });
        expect(result).toEqual(user);
    });

    it('findByEmail retourne un utilisateur', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
        const result = await repo.findByEmail('test@example.com');
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
        expect(result).toEqual(user);
    });

    it('findById retourne un utilisateur', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
        const result = await repo.findById(1);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(user);
    });

    it('updateUser met à jour un utilisateur', async () => {
        (prisma.user.update as jest.Mock).mockResolvedValue(user);
        const result = await repo.updateUser(1, { name: 'New' });
        expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { name: 'New' } });
        expect(result).toEqual(user);
    });

    it('deleteUser supprime un utilisateur', async () => {
        (prisma.user.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteUser(1);
        expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('listUsers retourne une liste', async () => {
        (prisma.user.findMany as jest.Mock).mockResolvedValue([user]);
        const result = await repo.listUsers({ role: 'USER' });
        expect(prisma.user.findMany).toHaveBeenCalledWith({ where: { role: 'USER' } });
        expect(result).toEqual([user]);
    });

    it('disableUser désactive un utilisateur', async () => {
        (prisma.user.update as jest.Mock).mockResolvedValue(undefined);
        await repo.disableUser(1);
        expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isEmailVerified: false } });
    });

    it('signIn retourne un utilisateur', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
        const result = await repo.signIn('test@example.com', 'hashed');
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com', password: 'hashed' } });
        expect(result).toEqual(user);
    });

    it('signInWithGoogle retourne un utilisateur', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
        const result = await repo.signInWithGoogle('googleid');
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { googleId: 'googleid' } });
        expect(result).toEqual(user);
    });

    it('setRole met à jour le rôle', async () => {
        (prisma.user.update as jest.Mock).mockResolvedValue(undefined);
        await repo.setRole(1, 'ADMIN');
        expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { role: 'ADMIN' } });
    });

    it('forceLogout force la déconnexion', async () => {
        (prisma.user.update as jest.Mock).mockResolvedValue(undefined);
        await repo.forceLogout(1);
        expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { authProvider: 'FORCED_LOGOUT' } });
    });

    it('deleteSensitiveData supprime les données sensibles', async () => {
        (prisma.notification.deleteMany as jest.Mock).mockResolvedValue(undefined);
        (prisma.address.deleteMany as jest.Mock).mockResolvedValue(undefined);
        (prisma.cart.deleteMany as jest.Mock).mockResolvedValue(undefined);
        (prisma.ticket.deleteMany as jest.Mock).mockResolvedValue(undefined);
        (prisma.review.deleteMany as jest.Mock).mockResolvedValue(undefined);
        (prisma.userActivity.deleteMany as jest.Mock).mockResolvedValue(undefined);
        (prisma.auditLog.deleteMany as jest.Mock).mockResolvedValue(undefined);
        (prisma.user.update as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteSensitiveData(1);
        expect(prisma.notification.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(prisma.address.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(prisma.cart.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(prisma.ticket.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(prisma.review.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(prisma.userActivity.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(prisma.auditLog.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isEmailVerified: false } });
    });

    it('updateConsentPreferences met à jour les préférences', async () => {
        (prisma.user.update as jest.Mock).mockResolvedValue(undefined);
        const preferences = {
            marketing: true,
            analytics: false,
            necessary: true,
            preferences: false,
            lastUpdated: new Date(),
        };
        await repo.updateConsentPreferences(1, preferences);
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                consentPreferences: expect.objectContaining({
                    marketing: true,
                    analytics: false,
                    necessary: true,
                    preferences: false,
                }),
            },
        });
    });

    it('getConsentPreferences retourne les préférences', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            consentPreferences: {
                marketing: true,
                analytics: false,
                necessary: true,
                preferences: false,
                lastUpdated: new Date().toISOString(),
            }
        });
        const result = await repo.getConsentPreferences(1);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, select: { consentPreferences: true } });
        expect(result).toMatchObject({ marketing: true, analytics: false, necessary: true, preferences: false });
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.user.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createUser(user)).rejects.toThrow('fail');
    });
}); 
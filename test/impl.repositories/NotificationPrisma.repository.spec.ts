import { NotificationPrismaRepository } from '../../src/infrastructure/impl.repositories/NotificationPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        notification: {
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            createMany: jest.fn(),
            deleteMany: jest.fn(),
        },
    },
}));

describe('NotificationPrismaRepository', () => {
    let repo: NotificationPrismaRepository;
    const notif = { id: 1, userId: 1, message: 'msg', isRead: false };

    beforeEach(() => {
        repo = new NotificationPrismaRepository();
        jest.clearAllMocks();
    });

    it('createNotification crée une notif', async () => {
        (prisma.notification.create as jest.Mock).mockResolvedValue(notif);
        const result = await repo.createNotification(notif as any);
        expect(prisma.notification.create).toHaveBeenCalledWith({ data: notif });
        expect(result).toEqual(notif);
    });

    it('markAsRead met à jour la notif', async () => {
        (prisma.notification.update as jest.Mock).mockResolvedValue(undefined);
        await repo.markAsRead(1);
        expect(prisma.notification.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isRead: true } });
    });

    it('listNotifications retourne les notifs', async () => {
        (prisma.notification.findMany as jest.Mock).mockResolvedValue([notif]);
        const result = await repo.listNotifications(1);
        expect(prisma.notification.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(result).toEqual([notif]);
    });

    it('sendBulkNotification crée plusieurs notifs', async () => {
        (prisma.notification.createMany as jest.Mock).mockResolvedValue(undefined);
        await repo.sendBulkNotification([notif as any]);
        expect(prisma.notification.createMany).toHaveBeenCalledWith({ data: [notif] });
    });

    it('findByUserId retourne les notifs par user', async () => {
        (prisma.notification.findMany as jest.Mock).mockResolvedValue([notif]);
        const result = await repo.findByUserId(1);
        expect(prisma.notification.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(result).toEqual([notif]);
    });

    it('deleteByUserId supprime les notifs par user', async () => {
        (prisma.notification.deleteMany as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteByUserId(1);
        expect(prisma.notification.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.notification.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createNotification(notif as any)).rejects.toThrow('fail');
    });
}); 
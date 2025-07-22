import { TicketPrismaRepository } from '../../src/infrastructure/impl.repositories/TicketPrisma.repository';
import prisma from '../../prisma/client/prisma.service';

jest.mock('../../prisma/client/prisma.service', () => ({
    __esModule: true,
    default: {
        ticket: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('TicketPrismaRepository', () => {
    let repo: TicketPrismaRepository;
    const ticket = { id: 1, userId: 1, subject: 'Test', response: '' };

    beforeEach(() => {
        repo = new TicketPrismaRepository();
        jest.clearAllMocks();
    });

    it('createTicket crée un ticket', async () => {
        (prisma.ticket.create as jest.Mock).mockResolvedValue(ticket);
        const result = await repo.createTicket(ticket as any);
        expect(prisma.ticket.create).toHaveBeenCalledWith({ data: ticket });
        expect(result).toEqual(ticket);
    });

    it('updateTicket met à jour un ticket', async () => {
        (prisma.ticket.update as jest.Mock).mockResolvedValue(ticket);
        const result = await repo.updateTicket(1, { subject: 'New' });
        expect(prisma.ticket.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { subject: 'New' } });
        expect(result).toEqual(ticket);
    });

    it('deleteTicket supprime un ticket', async () => {
        (prisma.ticket.delete as jest.Mock).mockResolvedValue(undefined);
        await repo.deleteTicket(1);
        expect(prisma.ticket.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('findById retourne un ticket', async () => {
        (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(ticket);
        const result = await repo.findById(1);
        expect(prisma.ticket.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(ticket);
    });

    it('listTickets retourne une liste', async () => {
        (prisma.ticket.findMany as jest.Mock).mockResolvedValue([ticket]);
        const result = await repo.listTickets({ userId: 1 });
        expect(prisma.ticket.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
        expect(result).toEqual([ticket]);
    });

    it('replyToTicket met à jour la réponse', async () => {
        (prisma.ticket.update as jest.Mock).mockResolvedValue(undefined);
        await repo.replyToTicket(1, 'Réponse');
        expect(prisma.ticket.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { response: 'Réponse' } });
    });

    it('propage les erreurs Prisma', async () => {
        (prisma.ticket.create as jest.Mock).mockRejectedValue(new Error('fail'));
        await expect(repo.createTicket(ticket as any)).rejects.toThrow('fail');
    });
}); 
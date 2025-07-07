import prisma from '../../../prisma/client/prisma.service';
import { TicketEntity } from '../../domain/entities/Ticket.entity';
import { ITicketRepository } from '../../domain/repositories/Ticket.repository';

export class TicketPrismaRepository implements ITicketRepository {
    async createTicket(data: TicketEntity): Promise<TicketEntity> {
        try {
            return await prisma.ticket.create({ data }) as TicketEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateTicket(id: number, data: Partial<TicketEntity>): Promise<TicketEntity> {
        try {
            return await prisma.ticket.update({ where: { id }, data }) as TicketEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteTicket(id: number): Promise<void> {
        try {
            await prisma.ticket.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<TicketEntity> {
        try {
            return await prisma.ticket.findUnique({ where: { id } }) as TicketEntity;
        } catch (error) {
            throw error;
        }
    }
    async listTickets(filter?: Partial<TicketEntity>): Promise<TicketEntity[]> {
        try {
            return await prisma.ticket.findMany({ where: filter }) as TicketEntity[];
        } catch (error) {
            throw error;
        }
    }
    async replyToTicket(id: number, response: string): Promise<void> {
        try {
            await prisma.ticket.update({ where: { id }, data: { response } });
        } catch (error) {
            throw error;
        }
    }
} 
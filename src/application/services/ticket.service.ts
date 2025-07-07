import { Injectable, Inject } from '@nestjs/common';
import { TicketPrismaRepository } from '../../infrastructure/impl.repositories/TicketPrisma.repository';
import { TicketEntity } from '../../domain/entities/Ticket.entity';

@Injectable()
export class TicketService {
    constructor(
        @Inject(TicketPrismaRepository) private readonly repository: TicketPrismaRepository,
    ) { }

    async createTicket(data: TicketEntity) {
        try {
            return await this.repository.createTicket(data);
        } catch (error) {
            throw error;
        }
    }
    async updateTicket(id: number, data: Partial<TicketEntity>) {
        try {
            return await this.repository.updateTicket(id, data);
        } catch (error) {
            throw error;
        }
    }
    async deleteTicket(id: number) {
        try {
            return await this.repository.deleteTicket(id);
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number) {
        try {
            return await this.repository.findById(id);
        } catch (error) {
            throw error;
        }
    }
    async listTickets(filter?: Partial<TicketEntity>) {
        try {
            return await this.repository.listTickets(filter);
        } catch (error) {
            throw error;
        }
    }
} 
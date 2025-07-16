import { TicketEntity } from "../entities/Ticket.entity";

export interface ITicketRepository {
    createTicket(data: TicketEntity): Promise<TicketEntity>;
    updateTicket(id: number, data: Partial<TicketEntity>): Promise<TicketEntity>;
    deleteTicket(id: number): Promise<void>;
    findById(id: number): Promise<TicketEntity>;
    listTickets(filter?: Partial<TicketEntity>): Promise<TicketEntity[]>;
} 
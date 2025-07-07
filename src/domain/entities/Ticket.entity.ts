import { TicketStatus } from "../enums/TicketStatus.enum";
import { UserEntity } from "./User.entity";

export class TicketEntity {
    id: number;
    userId: number;
    status: TicketStatus;
    createdAt: Date;
    updatedAt: Date;
    subject: string;
    description: string;
    response?: string;
    user?: UserEntity;
}

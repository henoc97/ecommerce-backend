import { Controller, Post, Get, Param, Query, Body, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { TicketService } from '../../application/services/ticket.service';
import { CreateTicketDto, TicketResponseDto } from '../dtos/Ticket.dto';
import { AuthGuard } from '@nestjs/passport';
import { TicketStatus } from '../../domain/enums/TicketStatus.enum';

@ApiTags('tickets')
@Controller('tickets')
export class TicketController {
    constructor(private readonly ticketService: TicketService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Créer un ticket de support' })
    @ApiBody({ type: CreateTicketDto })
    @ApiResponse({ status: 201, type: TicketResponseDto, description: 'Ticket créé avec succès' })
    @ApiResponse({ status: 400, description: 'Objet ou description invalide' })
    @ApiResponse({ status: 500, description: 'Erreur technique, veuillez réessayer' })
    async createTicket(@Body() dto: CreateTicketDto) {
        console.log('[TicketController] createTicket', dto);
        // Validation simple
        if (!dto.subject || dto.subject.length < 3 || !dto.description || dto.description.length < 5) {
            console.error('[TicketController] createTicket INVALID', dto);
            throw new HttpException('Objet ou description invalide', HttpStatus.BAD_REQUEST);
        }
        try {
            const ticket = await this.ticketService.createTicket({
                ...dto,
                status: TicketStatus.OPEN,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);
            console.log('[TicketController] createTicket SUCCESS', ticket);
            return ticket;
        } catch (error) {
            console.error('[TicketController] createTicket ERROR', error);
            throw new HttpException('Erreur technique, veuillez réessayer', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Lister les tickets d’un utilisateur' })
    @ApiQuery({ name: 'userId', required: true })
    @ApiResponse({ status: 200, type: [TicketResponseDto] })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async listTickets(@Query('userId') userId: number) {
        console.log('[TicketController] listTickets', { userId });
        try {
            const tickets = await this.ticketService.listTickets({ userId: Number(userId) });
            console.log('[TicketController] listTickets SUCCESS', tickets);
            return tickets;
        } catch (error) {
            console.error('[TicketController] listTickets ERROR', error);
            throw new HttpException('Erreur technique, veuillez réessayer', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/:id')
    @ApiOperation({ summary: 'Voir le détail d’un ticket' })
    @ApiParam({ name: 'id', required: true })
    @ApiResponse({ status: 200, type: TicketResponseDto })
    @ApiResponse({ status: 404, description: 'Ce ticket n’existe pas ou vous n’y avez pas accès' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async getTicket(@Param('id') id: number, @Req() req: any) {
        console.log('[TicketController] getTicket', { id, userId: req.user.id });
        try {
            const ticket = await this.ticketService.findById(Number(id));
            if (!ticket || ticket.userId !== req.user.id) {
                console.error('[TicketController] getTicket NOT FOUND', { id });
                throw new HttpException('Ce ticket n’existe pas ou vous n’y avez pas accès', HttpStatus.NOT_FOUND);
            }
            console.log('[TicketController] getTicket SUCCESS', ticket);
            return ticket;
        } catch (error) {
            console.error('[TicketController] getTicket ERROR', error);
            throw new HttpException('Erreur technique, veuillez réessayer', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 
import { Controller, Post, Get, Body, Query, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TicketService } from '../../application/services/ticket.service';
import { TicketEntity } from '../../domain/entities/Ticket.entity';
import { TicketStatus } from '../../domain/enums/TicketStatus.enum';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketController {
    constructor(private readonly ticketService: TicketService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Créer un ticket de support', description: 'Permet de créer un nouveau ticket de support pour un utilisateur.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                subject: { type: 'string', example: 'Problème de paiement' },
                description: { type: 'string', example: 'Impossible de finaliser le paiement sur ma boutique.' }
            },
            required: ['subject', 'description']
        }
    })
    @ApiResponse({ status: 201, description: 'Ticket créé avec succès', })
    @ApiResponse({ status: 400, description: 'Sujet ou description manquant ou trop court', type: HttpException })
    @ApiResponse({ status: 401, description: 'Non authentifié', type: HttpException })
    @ApiResponse({ status: 500, description: 'Erreur serveur', type: HttpException })
    async createTicket(@Body() body: any, @Req() req: any) {
        console.log('[TicketController] createTicket', { user: req.user, body });
        try {
            const user = req.user;
            if (!body.subject || !body.description) {
                console.log('[TicketController] createTicket BAD_REQUEST');
                throw new HttpException('Sujet ou description manquant', HttpStatus.BAD_REQUEST);
            }
            if (typeof body.subject !== 'string' || typeof body.description !== 'string' || body.subject.length < 3 || body.description.length < 5) {
                throw new HttpException('Sujet ou description trop court', HttpStatus.BAD_REQUEST);
            }
            const ticket: Partial<TicketEntity> = {
                userId: user.id,
                subject: body.subject,
                description: body.description,
                status: TicketStatus.OPEN,
            };
            const created = await this.ticketService.createTicket(ticket as TicketEntity);
            console.log('[TicketController] createTicket SUCCESS', created);
            return { ticketId: created.id };
        } catch (e) {
            console.error('[TicketController] createTicket ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur serveur lors de la création du ticket', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Lister les tickets du commerçant ou client', description: 'Permet de lister les tickets associés à un utilisateur spécifique.' })
    @ApiQuery({ name: 'userId', required: true, description: 'ID du commerçant ou client pour lequel on souhaite lister les tickets.' })
    @ApiResponse({ status: 200, description: 'Liste des tickets', type: [TicketEntity] })
    @ApiResponse({ status: 400, description: 'userId manquant', type: HttpException })
    @ApiResponse({ status: 401, description: 'Non authentifié', type: HttpException })
    @ApiResponse({ status: 500, description: 'Erreur serveur', type: HttpException })
    async listTickets(@Query('userId') userId: number, @Req() req: any) {
        console.log('[TicketController] listTickets', { userId });
        try {
            if (!userId) {
                console.log('[TicketController] listTickets BAD_REQUEST');
                throw new HttpException('userId requis', HttpStatus.BAD_REQUEST);
            }
            // Vérification que le userId correspond bien à l'utilisateur connecté
            if (userId !== req.user.id) {
                console.log('[TicketController] listTickets FORBIDDEN');
                throw new HttpException('Accès interdit', HttpStatus.FORBIDDEN);
            }
            const tickets = await this.ticketService.listTickets({ userId });
            console.log('[TicketController] listTickets SUCCESS', tickets);
            return tickets || [];
        } catch (e) {
            console.error('[TicketController] listTickets ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur serveur lors de la récupération des tickets', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 
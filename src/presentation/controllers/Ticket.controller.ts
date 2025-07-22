import { Controller, Post, Get, Body, Query, UseGuards, Req, HttpException, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TicketService } from '../../application/services/ticket.service';
import { TicketEntity } from '../../domain/entities/Ticket.entity';
import { TicketStatus } from '../../domain/enums/TicketStatus.enum';
import { Roles } from '../../application/helpers/roles.decorator';
import { RolesGuard } from '../../application/helpers/roles.guard';
import { UserRole } from 'src/domain/enums/UserRole.enum';


@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.CLIENT, UserRole.ADMIN)
@Controller('tickets')
export class TicketController {
    constructor(private readonly ticketService: TicketService) { }

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

    @Get()
    @ApiOperation({ summary: 'Lister les tickets', description: 'Retourne la liste des tickets, filtrable par boutique (shopId) ou utilisateur (userId).' })
    @ApiQuery({ name: 'shopId', required: false, description: 'ID de la boutique' })
    @ApiQuery({ name: 'userId', required: false, description: 'ID de l\'utilisateur' })
    @ApiResponse({ status: 200, description: 'Liste des tickets' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async listTickets(@Query('shopId') shopId?: string, @Query('userId') userId?: string) {
        console.log('[TicketController] listTickets', { shopId, userId });
        try {
            const filter: any = {};
            if (shopId) filter.shopId = Number(shopId);
            if (userId) filter.userId = Number(userId);
            const tickets = await this.ticketService.listTickets(filter);
            console.log('[TicketController] listTickets SUCCESS', tickets);
            return tickets || [];
        } catch (e) {
            console.error('[TicketController] listTickets ERROR', e);
            throw new HttpException('Erreur serveur lors de la récupération des tickets', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post(':id/reply')
    @ApiOperation({ summary: 'Répondre à un ticket', description: 'Ajoute une réponse à un ticket de support.' })
    @ApiParam({ name: 'id', required: true, description: 'ID du ticket' })
    @ApiBody({ schema: { type: 'object', properties: { content: { type: 'string', example: 'Votre problème a été résolu.' } }, required: ['content'] } })
    @ApiResponse({ status: 200, description: 'Réponse enregistrée' })
    @ApiResponse({ status: 400, description: 'Message vide ou invalide' })
    @ApiResponse({ status: 404, description: 'Ticket non trouvé' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async replyToTicket(@Param('id') id: number, @Body('content') content: string) {
        console.log('[TicketController] replyToTicket', { id, content });
        if (!content || content.trim().length === 0) {
            throw new HttpException('Message vide ou invalide', HttpStatus.BAD_REQUEST);
        }
        try {
            const updated = await this.ticketService.updateTicket(id, { response: content });
            if (!updated) {
                console.error('Ticket non trouvé');
                throw new HttpException('Ticket non trouvé', HttpStatus.NOT_FOUND);
            }
            console.log('[TicketController] replyToTicket SUCCESS', updated);
            return { success: true };
        } catch (e) {
            console.error('[TicketController] replyToTicket ERROR', e);
            throw new HttpException('Erreur serveur lors de la réponse au ticket', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 
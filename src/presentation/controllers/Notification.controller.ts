import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from '../../application/services/notification.service';
import { Roles } from '../../application/helper/roles.decorator';
import { RolesGuard } from '../../application/helper/roles.guard';
import { NotificationResponseDto, MarkNotificationAsReadDto } from '../dtos/Notification.dto';
import { UserRole } from 'src/domain/enums/UserRole.enum';
import { ConsentGuard } from '../../application/helper/consent.guard';
import { RequiresConsent } from '../../application/helper/requires-consent.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, ConsentGuard)
@Roles(UserRole.CLIENT, UserRole.SELLER, UserRole.ADMIN)
@Controller('notifications')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Récupérer les notifications d’un utilisateur' })
    @ApiQuery({ name: 'userId', description: 'shopId est userId dans le context du seller', required: true })
    @ApiResponse({ status: 200, type: [NotificationResponseDto] })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async listNotifications(@Query('userId') userId: number) {
        console.log('[NotificationController] listNotifications', { userId });
        try {
            const notifications = await this.notificationService.listNotifications(Number(userId));
            console.log('[NotificationController] listNotifications SUCCESS', notifications);
            return notifications;
        } catch (error) {
            console.error('[NotificationController] listNotifications ERROR', error);
            throw new HttpException('Erreur technique, veuillez réessayer', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id/mark-as-read')
    @ApiOperation({ summary: 'Marquer une notification comme lue' })
    @ApiParam({ name: 'id', required: true })
    @ApiBody({ type: MarkNotificationAsReadDto })
    @ApiResponse({ status: 200, description: 'Notification mise à jour' })
    @ApiResponse({ status: 404, description: 'Notification introuvable' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async markAsRead(@Param('id') id: number, @Body() body: MarkNotificationAsReadDto, @Req() req: any) {
        console.log('[NotificationController] markAsRead', { id, body });
        try {
            // Optionnel : vérifier que la notif appartient bien à l'utilisateur connecté
            const notifList = await this.notificationService.listNotifications(req.user.id);
            const notif = notifList.find(n => n.id === Number(id));
            if (!notif) {
                console.error('[NotificationController] markAsRead NOT FOUND', { id });
                throw new HttpException('Cette notification n’existe plus', HttpStatus.NOT_FOUND);
            }
            await this.notificationService.markAsRead(Number(id));
            console.log('[NotificationController] markAsRead SUCCESS', { id });
            return { message: 'Notification mise à jour' };
        } catch (error) {
            console.error('[NotificationController] markAsRead ERROR', error);
            throw new HttpException('Erreur technique, veuillez réessayer', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post()
    @ApiOperation({ summary: 'Envoyer une notification à plusieurs utilisateurs' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['type', 'content', 'userIds'],
            properties: {
                type: { type: 'string', enum: ['INFO', 'PROMOTION', 'ORDER_UPDATE', 'WARNING'], description: 'Type de notification' },
                content: { type: 'string', description: 'Contenu de la notification' },
                userIds: { type: 'array', items: { type: 'number' }, description: 'Liste des IDs utilisateurs à notifier' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Notifications envoyées' })
    @ApiResponse({ status: 400, description: 'Type, contenu ou userIds manquant' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @RequiresConsent('marketing')
    async sendBulkNotification(@Body() body: any) {
        const { type, content, userIds } = body;
        console.log('[NotificationController] sendBulkNotification', { type, content, userIds });
        if (!type || !content || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
            console.error('[NotificationController] sendBulkNotification BAD REQUEST', { type, content, userIds });
            throw new HttpException('Type, contenu ou userIds manquant', HttpStatus.BAD_REQUEST);
        }
        try {
            const notifications = userIds.map((userId: number) => ({
                id: undefined,
                userId,
                type,
                content,
                isRead: false,
                sentAt: new Date(),
            }));
            await this.notificationService.sendBulkNotification(notifications);
            console.log('[NotificationController] sendBulkNotification SUCCESS');
            return { message: 'Notifications envoyées' };
        } catch (error) {
            console.error('[NotificationController] sendBulkNotification ERROR', error);
            throw new HttpException('Erreur technique, veuillez réessayer', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 
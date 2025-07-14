import { Controller, Get, Put, Param, Query, Body, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { NotificationService } from '../../application/services/notification.service';
import { NotificationResponseDto, MarkNotificationAsReadDto } from '../dtos/Notification.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Récupérer les notifications d’un utilisateur' })
    @ApiQuery({ name: 'userId', required: true })
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

    @UseGuards(AuthGuard('jwt'))
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
} 
import { Controller, Post, Delete, Body, Param, HttpException, HttpStatus, UseGuards, Inject, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../../application/services/user.service';
import { AuditLogService } from '../../application/services/auditlog.service';
import { ReviewService } from '../../application/services/review.service';
import { AuditLogAction } from 'src/domain/enums/AuditLogAction.enum';
import { AuditLogEntity } from 'src/domain/entities/AuditLog.entity';
import { Roles } from '../../application/helper/roles.decorator';
import { RolesGuard } from '../../application/helper/roles.guard';
import { UserRole } from 'src/domain/enums/UserRole.enum';


@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
    constructor(
        @Inject(UserService) private readonly userService: UserService,
        @Inject(AuditLogService) private readonly auditLogService: AuditLogService,
        @Inject(ReviewService) private readonly reviewService: ReviewService,
    ) { }

    @Post('force-logout')
    @ApiOperation({ summary: 'Forcer la déconnexion d’un utilisateur' })
    @ApiBody({ schema: { type: 'object', properties: { userId: { type: 'number' } }, required: ['userId'] } })
    @ApiResponse({ status: 200, description: 'Utilisateur déconnecté' })
    @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async forceLogout(@Body('userId') userId: number, @Req() req: any) {
        // Vérification du rôle supprimée (gérée par le guard)
        console.log('[AdminController] forceLogout', { userId });
        try {
            const user = await this.userService.findById(userId);
            if (!user) {
                console.error('[AdminController] forceLogout NOT FOUND', { userId });
                throw new HttpException('Utilisateur introuvable', HttpStatus.NOT_FOUND);
            }
            await this.userService.forceLogout(userId);
            await this.auditLogService.logAction({
                userId,
                action: AuditLogAction.DELETED,
                entity: 'User',
                entityId: userId,
                changes: {},
            } as AuditLogEntity);
            console.log('[AdminController] forceLogout SUCCESS', { userId });
            return { message: 'Utilisateur déconnecté' };
        } catch (e) {
            console.error('[AdminController] forceLogout ERROR', e);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('user-data')
    @ApiOperation({ summary: 'Supprimer les données sensibles d’un utilisateur' })
    @ApiBody({ schema: { type: 'object', properties: { userId: { type: 'number' } }, required: ['userId'] } })
    @ApiResponse({ status: 204, description: 'Données supprimées' })
    @ApiResponse({ status: 403, description: 'Action non autorisée' })
    @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async deleteUserData(@Body('userId') userId: number, @Req() req: any) {
        // Vérification du rôle supprimée (gérée par le guard)
        console.log('[AdminController] deleteUserData', { userId });
        try {
            const user = await this.userService.findById(userId);
            if (!user) {
                console.error('[AdminController] deleteUserData NOT FOUND', { userId });
                throw new HttpException('Utilisateur introuvable', HttpStatus.NOT_FOUND);
            }
            // Suppression des données sensibles (adresse, notifications, panier, etc.)
            await this.userService.deleteSensitiveData(userId);
            await this.auditLogService.logAction({
                userId,
                action: AuditLogAction.DELETED,
                entity: 'User',
                entityId: userId,
                changes: {},
            } as AuditLogEntity);
            console.log('[AdminController] deleteUserData SUCCESS', { userId });
            return { message: 'Données supprimées' };
        } catch (e) {
            if (e.status === HttpStatus.FORBIDDEN) throw e;
            console.error('[AdminController] deleteUserData ERROR', e);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('review/:id')
    @ApiOperation({ summary: 'Modérer (supprimer) un avis client' })
    @ApiParam({ name: 'id', required: true })
    @ApiResponse({ status: 200, description: 'Avis supprimé' })
    @ApiResponse({ status: 404, description: 'Avis non trouvé' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async moderateReview(@Param('id') id: number, @Req() req: any) {
        // Vérification du rôle supprimée (gérée par le guard)
        console.log('[AdminController] moderateReview', { id });
        try {
            const review = await this.reviewService.findById(id);
            if (!review) {
                console.error('[AdminController] moderateReview NOT FOUND', { id });
                throw new HttpException('Avis non trouvé', HttpStatus.NOT_FOUND);
            }
            await this.reviewService.deleteReview(id);
            await this.auditLogService.logAction({
                userId: review.userId,
                action: AuditLogAction.DELETED,
                entity: 'Review',
                entityId: id,
                changes: {},
            } as AuditLogEntity);
            console.log('[AdminController] moderateReview SUCCESS', { id });
            return { message: 'Avis supprimé' };
        } catch (e) {
            console.error('[AdminController] moderateReview ERROR', e);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
import { Controller, Get, Post, Body, Query, UseGuards, Req, HttpException, HttpStatus, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiProperty, ApiQuery, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserActivityService } from 'src/application/services/useractivity.service';
import { AuthGuard } from '@nestjs/passport';
import { UserActivityEntity } from 'src/domain/entities/UserActivity.entity';
import { UserActivityDto } from '../dtos/UserActivity.dto';
import { AuditLogService } from '../../application/services/auditlog.service';
import { Roles } from '../../application/helpers/roles.decorator';
import { RolesGuard } from '../../application/helpers/roles.guard';
import { UserRole } from 'src/domain/enums/UserRole.enum';
import { ConsentGuard } from '../../application/helpers/consent.guard';
import { RequiresConsent } from '../../application/helpers/requires-consent.decorator';


@ApiTags('Activités Utilisateur')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, ConsentGuard)
@Roles(UserRole.CLIENT, UserRole.ADMIN)
@Controller('user-activities')
export class UserActivityController {
    constructor(
        private readonly userActivityService: UserActivityService,
        private readonly auditLogService: AuditLogService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @RequiresConsent('analytics')
    @ApiOperation({ summary: 'Enregistrer une activité utilisateur (SEARCH, VIEW_PRODUCT, ADD_TO_CART, REMOVE_FROM_CART, PURCHASE)' })
    @ApiBody({ type: UserActivityDto })
    @ApiResponse({ status: 201, description: 'Activité enregistrée' })
    @ApiResponse({ status: 400, description: 'Requête invalide' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Post()
    async logActivity(@Body() body: UserActivityDto, @Req() req: any, @Res() res: Response) {
        console.log('[UserActivityController] logActivity', { user: req.user, body });
        try {
            if (!body.action) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Action requise' });
            }
            const user = req.user as any;
            (body as any).userId = user.id;
            await this.userActivityService.logActivity(body as UserActivityEntity);
            console.log('[UserActivityController] logActivity SUCCESS', body);
            return res.status(HttpStatus.CREATED).json({ message: 'Activité enregistrée' });
        } catch (error) {
            console.error('[UserActivityController] logActivity ERROR', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Lister les interactions clients sur une boutique' })
    @ApiQuery({ name: 'shopId', required: true, description: 'ID de la boutique' })
    @ApiResponse({ status: 200, description: 'Liste des activités clients' })
    @ApiResponse({ status: 403, description: 'Accès interdit ou non autorisé' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async getShopUserActivities(@Query('shopId') shopId: number) {
        console.log('[UserActivityController] getShopUserActivities', { shopId });
        try {
            if (!shopId) {
                console.log('[UserActivityController] getShopUserActivities BAD_REQUEST');
                throw new HttpException('shopId requis', HttpStatus.BAD_REQUEST);
            }
            // On suppose que le service filtre bien par shopId
            const activities = await this.userActivityService.getShopActivities(shopId);
            console.log('[UserActivityController] getShopUserActivities SUCCESS', activities);
            return activities || [];
        } catch (e) {
            console.error('[UserActivityController] getShopUserActivities ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/all')
    @ApiOperation({ summary: 'Lister toutes les activités utilisateur avec filtres dynamiques (admin)' })
    @ApiQuery({ name: 'userId', required: false })
    @ApiQuery({ name: 'action', required: false })
    @ApiQuery({ name: 'productId', required: false })
    @ApiQuery({ name: 'orderId', required: false })
    @ApiQuery({ name: 'from', required: false, description: 'Date de début (ISO)' })
    @ApiQuery({ name: 'to', required: false, description: 'Date de fin (ISO)' })
    @ApiResponse({ status: 200, description: 'Liste filtrée des activités utilisateur' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async listAllActivities(@Query() query: any) {
        console.log('[UserActivityController] listAllActivities', query);
        try {
            const filter: any = {};
            if (query.userId) filter.userId = Number(query.userId);
            if (query.action) filter.action = query.action;
            if (query.productId) filter.productId = Number(query.productId);
            if (query.orderId) filter.orderId = Number(query.orderId);
            if (query.from || query.to) {
                filter.createdAt = {};
                if (query.from) filter.createdAt["gte"] = new Date(query.from);
                if (query.to) filter.createdAt["lte"] = new Date(query.to);
            }
            const activities = await this.userActivityService.listActivities(filter);
            console.log('[UserActivityController] listAllActivities SUCCESS', activities);
            return activities || [];
        } catch (e) {
            console.error('[UserActivityController] listAllActivities ERROR', e);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


} 
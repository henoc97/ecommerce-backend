import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogService } from "src/application/services/auditlog.service";
import { Roles } from '../../application/helpers/roles.decorator';
import { RolesGuard } from '../../application/helpers/roles.guard';
import { UserRole } from 'src/domain/enums/UserRole.enum';


@ApiTags('Logs d\'audit')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('audit-logs')
export class AuditLogController {
    constructor(
        private readonly auditLogService: AuditLogService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Visualiser son propre historique d\'actions' })
    @ApiQuery({ name: 'userId', required: true, description: 'ID de l\'utilisateur (shop)' })
    @ApiResponse({ status: 200, description: 'Liste des logs d\'audit' })
    @ApiResponse({ status: 403, description: 'Accès interdit ou non autorisé' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async getUserAuditLogs(@Query('userId') userId: number) {
        console.log('[UserActivityController] getUserAuditLogs', { userId });
        try {
            if (!userId) {
                console.log('[UserActivityController] getUserAuditLogs BAD_REQUEST');
                throw new HttpException('userId requis', HttpStatus.BAD_REQUEST);
            }
            // On suppose que le service filtre bien par userId
            const logs = await this.auditLogService.listLogs({ userId });
            console.log('[UserActivityController] getUserAuditLogs SUCCESS', logs);
            return logs || [];
        } catch (e) {
            console.error('[UserActivityController] getUserAuditLogs ERROR', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/all')
    @ApiOperation({ summary: 'Lister tous les logs d’audit avec filtres dynamiques (admin)' })
    @ApiQuery({ name: 'userId', required: false })
    @ApiQuery({ name: 'entity', required: false })
    @ApiQuery({ name: 'entityId', required: false })
    @ApiQuery({ name: 'action', required: false })
    @ApiQuery({ name: 'from', required: false, description: 'Date de début (ISO)' })
    @ApiQuery({ name: 'to', required: false, description: 'Date de fin (ISO)' })
    @ApiResponse({ status: 200, description: 'Liste filtrée des logs d’audit' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async listAllAuditLogs(@Query() query: any) {
        console.log('[AuditLogController] listAllAuditLogs', query);
        try {
            const filter: any = {};
            if (query.userId) filter.userId = Number(query.userId);
            if (query.entity) filter.entity = query.entity;
            if (query.entityId) filter.entityId = Number(query.entityId);
            if (query.action) filter.action = query.action;
            if (query.from || query.to) {
                filter.createdAt = {};
                if (query.from) filter.createdAt["gte"] = new Date(query.from);
                if (query.to) filter.createdAt["lte"] = new Date(query.to);
            }
            const logs = await this.auditLogService.listLogs(filter);
            console.log('[AuditLogController] listAllAuditLogs SUCCESS', logs);
            return logs || [];
        } catch (e) {
            console.error('[AuditLogController] listAllAuditLogs ERROR', e);
            throw new HttpException('Erreur serveur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
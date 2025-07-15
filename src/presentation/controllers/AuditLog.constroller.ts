import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogService } from "src/application/services/auditlog.service";


@ApiTags('Logs d\'audit')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditLogController {
    constructor(
        private readonly auditLogService: AuditLogService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
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
}
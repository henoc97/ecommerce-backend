import { Controller, Post, Body, Res, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { UserActivityService } from 'src/application/services/useractivity.service';
import { AuthGuard } from '@nestjs/passport';
import { UserActivityEntity } from 'src/domain/entities/UserActivity.entity';

class UserActivityDto {
    @ApiProperty({ example: 'SEARCH', description: 'Type d\'action utilisateur' })
    action: string;
    @ApiProperty({ example: 'chaussure', required: false })
    keyword?: string;
    @ApiProperty({ example: 123, required: false })
    productId?: number;
    @ApiProperty({ example: 456, required: false })
    orderId?: number;
}

@ApiTags('user-activity')
@Controller('user-activity')
export class UserActivityController {
    constructor(private readonly userActivityService: UserActivityService) { }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Enregistrer une activité utilisateur (SEARCH, VIEW_PRODUCT, ADD_TO_CART, REMOVE_FROM_CART, PURCHASE)' })
    @ApiBody({ type: UserActivityDto })
    @ApiResponse({ status: 201, description: 'Activité enregistrée' })
    @ApiResponse({ status: 400, description: 'Requête invalide' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Post()
    async logActivity(@Body() body: UserActivityDto, @Req() req: any, @Res() res: Response) {
        try {
            if (!body.action) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Action requise' });
            }
            const user = req.user as any;
            (body as any).userId = user.id;
            await this.userActivityService.logActivity(body as UserActivityEntity);
            return res.status(HttpStatus.CREATED).json({ message: 'Activité enregistrée' });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
        }
    }
} 
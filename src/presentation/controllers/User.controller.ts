import { Controller, Get, Post, Put, Body, Query, Param, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../../application/services/user.service';
import { UserEntity } from '../../domain/entities/User.entity';
import { UserRole } from '../../domain/enums/UserRole.enum';
import { VendorService } from '../../application/services/vendor.service';

@ApiTags('Utilisateurs')
@ApiBearerAuth()
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly vendorService: VendorService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Lister ou filtrer les utilisateurs', description: 'Récupère la liste des utilisateurs avec ou sans filtre.' })
    @ApiQuery({ name: 'filter', required: false, description: 'Filtre (nom, email, rôle, etc.)' })
    @ApiResponse({ status: 200, description: 'Liste des utilisateurs', type: [UserEntity] })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async listUsers(@Query('filter') filter: string) {
        console.log('[UserController] listUsers', { filter });
        try {
            let users: any;
            if (filter) {
                // On suppose que le service sait parser le filtre (ex: JSON ou string)
                users = await this.userService.listUsers(JSON.parse(filter));
            } else {
                users = await this.userService.listUsers();
            }
            console.log('[UserController] listUsers SUCCESS', users);
            return users || [];
        } catch (e) {
            console.error('[UserController] listUsers ERROR', e);
            throw new HttpException('Erreur serveur lors de la récupération des utilisateurs', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Créer un utilisateur (ADMIN ou SELLER)', description: 'Crée un nouvel utilisateur avec le rôle spécifié.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@email.com' },
                password: { type: 'string', example: 'motdepasse' },
                name: { type: 'string', example: 'Jean Dupont' },
                role: { type: 'string', enum: Object.values(UserRole), example: 'SELLER' }
            },
            required: ['email', 'password', 'name', 'role']
        }
    })
    @ApiResponse({ status: 201, description: 'Utilisateur créé', type: UserEntity })
    @ApiResponse({ status: 400, description: 'Champs obligatoires manquants ou email/mot de passe invalides' })
    @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async createUser(@Body() body: any) {
        console.log('[UserController] createUser', body);
        let created: any;
        try {
            if (!body.email || !body.password || !body.name || !body.role) {
                throw new HttpException('Champs obligatoires manquants', HttpStatus.BAD_REQUEST);
            }
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
                throw new HttpException('Email invalide', HttpStatus.BAD_REQUEST);
            }
            if (!Object.values(UserRole).includes(body.role)) {
                throw new HttpException('Rôle invalide', HttpStatus.BAD_REQUEST);
            }
            created = await this.userService.createUser(body as UserEntity);
            if (body.role === UserRole.SELLER) {
                try {
                    await this.vendorService.createVendor(created.id);
                } catch (err) {
                    // Rollback User si Vendor échoue
                    await this.userService.deleteUser(created.id);
                    console.error('[UserController] createUser VENDOR ERROR, rollback user', err);
                    throw new HttpException('Erreur lors de l\'association vendeur', HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            console.log('[UserController] createUser SUCCESS', created);
            return { userId: created.id };
        } catch (e: any) {
            if (e.code === 'P2002' || e.message?.includes('unique')) {
                throw new HttpException('Email déjà utilisé', HttpStatus.CONFLICT);
            }
            console.error('[UserController] createUser ERROR', e);
            throw new HttpException('Erreur serveur lors de la création de l\'utilisateur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    @ApiOperation({ summary: 'Mettre à jour ou désactiver un utilisateur', description: 'Met à jour les détails d\'un utilisateur existant ou le désactive.' })
    @ApiParam({ name: 'id', required: true, description: 'ID de l\'utilisateur à mettre à jour' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@email.com' },
                name: { type: 'string', example: 'Jean Dupont' },
                phone: { type: 'string', example: '+33612345678' },
                role: { type: 'string', enum: Object.values(UserRole), example: 'ADMIN' },
                isActive: { type: 'boolean', example: false }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Utilisateur mis à jour', type: UserEntity })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    async updateUser(@Param('id') id: number, @Body() body: any) {
        console.log('[UserController] updateUser', { id, body });
        try {
            const updated = await this.userService.updateUser(id, body);
            if (!updated) {
                throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
            }
            console.log('[UserController] updateUser SUCCESS', updated);
            return updated;
        } catch (e) {
            console.error('[UserController] updateUser ERROR', e);
            throw new HttpException('Erreur serveur lors de la mise à jour de l\'utilisateur', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 
import { Controller, Get, Put, Body, Req, Res, UseGuards, HttpStatus, HttpException, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/application/services/user.service';
import { AddressService } from 'src/application/services/address.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UserProfileResponseDto, UserProfileUpdateDto } from '../dtos/User.dto';
import { Roles } from '../../application/helper/roles.decorator';
import { RolesGuard } from '../../application/helper/roles.guard';
import { UserRole } from 'src/domain/enums/UserRole.enum';
import { ConsentGuard } from '../../application/helper/consent.guard';
import { RequiresConsent } from '../../application/helper/requires-consent.decorator';


@ApiTags('Profils Utilisateur')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, ConsentGuard)
@Roles(UserRole.CLIENT)
@Controller('user-profiles')
export class UserProfileController {
    constructor(
        @Inject(UserService) private readonly userService: UserService,
        @Inject(AddressService) private readonly addressService: AddressService
    ) { }

    @ApiOperation({ summary: 'Récupérer le profil utilisateur connecté' })
    @ApiResponse({ status: 200, description: 'Profil utilisateur', type: UserProfileResponseDto })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Get('me')
    async getProfile(@Req() req: Request, @Res() res: Response) {
        console.log('[UserProfileController] getProfile', { user: req.user });
        try {
            const user = req.user as any;
            if (!user) return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Veuillez vous connecter' });
            const userData = await this.userService.findById(user.id);
            if (!userData) return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Veuillez vous connecter' });
            const address = await this.addressService.findByUserId(user.id);
            if (!address) return res.status(HttpStatus.NOT_FOUND).json({ message: 'Adresse non trouvée' });

            const response = {
                email: userData.email,
                name: userData.name,
                phone: userData.phone,
                city: address.city,
                street: address.street,
                country: address.country,
                state: address.state,
                postalcode: address.postalCode
            };
            console.log('[UserProfileController] getProfile SUCCESS', response);
            return res.status(HttpStatus.OK).json(response);
        } catch (error) {
            console.error('[UserProfileController] getProfile ERROR', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Une erreur est survenue, réessayez plus tard' });
        }
    }

    @ApiOperation({ summary: 'Mettre à jour le profil utilisateur connecté' })
    @ApiBody({ type: UserProfileUpdateDto })
    @ApiResponse({ status: 200, description: 'Données personnelles mises à jour avec succès' })
    @ApiResponse({ status: 400, description: 'Champs invalides ou aucune donnée à mettre à jour' })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    @ApiResponse({ status: 409, description: 'Conflit (email déjà utilisé)' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @RequiresConsent('preferences')
    @Put('me/update')
    async updateProfile(@Req() req: Request, @Body() body: UserProfileUpdateDto, @Res() res: Response) {
        console.log('[UserProfileController] updateProfile', { user: req.user, body });
        try {
            const user = req.user as any;
            if (!user) return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Veuillez vous connecter' });
            // Séparer les champs User et Address
            const { email, name, phone, city, street, country, state, postalcode } = body;
            // Validation simple (exemple)
            if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Email mal formé' });
            }
            // Update User
            const userUpdate: any = {};
            if (email) userUpdate.email = email;
            if (name) userUpdate.name = name;
            if (phone) userUpdate.phone = phone;
            // Update Address
            const addressUpdate: any = {};
            if (city) addressUpdate.city = city;
            if (street) addressUpdate.street = street;
            if (country) addressUpdate.country = country;
            if (state) addressUpdate.state = state;
            if (postalcode) addressUpdate.postalCode = postalcode;
            // Appliquer les updates

            if (Object.keys(userUpdate).length === 0 && Object.keys(addressUpdate).length === 0) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Aucune donnée à mettre à jour' });
            }

            var userUpdated: any = null;
            var addressUpdated: any = null;
            if (Object.keys(userUpdate).length !== 0) {
                if (userUpdate.email) {
                    const existingUser = await this.userService.findByEmail(userUpdate.email);
                    if (existingUser && existingUser.id !== user.id) {
                        return res.status(HttpStatus.CONFLICT).json({ message: 'Cet email est déjà utilisé' });
                    }
                }
                userUpdated = await this.userService.updateUser(user.id, { ...userUpdate });
            }

            if (Object.keys(addressUpdate).length !== 0) {
                addressUpdated = await this.addressService.updateAddress(user.id, { ...addressUpdate });

            }

            if (!userUpdated && !addressUpdated) {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Une erreur est survenue, réessayez plus tard' });
            }

            console.log('[UserProfileController] updateProfile SUCCESS', { userUpdated, addressUpdated });
            return res.status(HttpStatus.OK).json({ message: 'Données personnelles mises à jour avec succès' });
        } catch (error) {
            console.error('[UserProfileController] updateProfile ERROR', error);
            if (error instanceof HttpException) {
                return res.status(error.getStatus()).json({ message: error.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Une erreur est survenue, réessayez plus tard' });
        }
    }
}


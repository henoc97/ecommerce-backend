import { Controller, Get, Put, Body, Req, Res, UseGuards, HttpStatus, HttpException, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/application/services/user.service';
import { AddressService } from 'src/application/services/address.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { UserProfileResponseDto, UserProfileUpdateDto } from '../dtos/user.dto';

@ApiTags('user')
@Controller()
export class UserProfileController {
    constructor(
        @Inject(UserService) private readonly userService: UserService,
        @Inject(AddressService) private readonly addressService: AddressService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Récupérer le profil utilisateur connecté' })
    @ApiResponse({ status: 200, description: 'Profil utilisateur', type: UserProfileResponseDto })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Get('me')
    async getProfile(@Req() req: Request, @Res() res: Response) {
        try {
            const user = req.user as any;
            if (!user) return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Veuillez vous connecter' });
            const userData = await this.userService.findById(user.id);
            if (!userData) return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Veuillez vous connecter' });
            const address = await this.addressService.findByUserId(user.id);
            if (!address) return res.status(HttpStatus.NOT_FOUND).json({ message: 'Adresse non trouvée' });

            return res.status(HttpStatus.OK).json({
                email: userData.email,
                name: userData.name,
                phone: userData.phone,
                city: address.city,
                street: address.street,
                country: address.country,
                state: address.state,
                postalcode: address.postalCode
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Une erreur est survenue, réessayez plus tard' });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Mettre à jour le profil utilisateur connecté' })
    @ApiBody({ type: UserProfileUpdateDto })
    @ApiResponse({ status: 200, description: 'Données personnelles mises à jour avec succès' })
    @ApiResponse({ status: 400, description: 'Champs invalides ou aucune donnée à mettre à jour' })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    @ApiResponse({ status: 409, description: 'Conflit (email déjà utilisé)' })
    @ApiResponse({ status: 500, description: 'Erreur serveur' })
    @Put('me/update')
    async updateProfile(@Req() req: Request, @Body() body: UserProfileUpdateDto, @Res() res: Response) {
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
                const existingUser = await this.userService.findByEmail(userUpdate.email);
                if (existingUser && existingUser.id !== user.id) {
                    return res.status(HttpStatus.CONFLICT).json({ message: 'Cet email est déjà utilisé' });
                }
            } else {
                userUpdated = await this.userService.updateUser(user.id, { ...userUpdate });
            }

            if (Object.keys(addressUpdate).length !== 0) {
                addressUpdated = await this.addressService.updateAddress(user.id, { ...addressUpdate });

            }

            if (!userUpdated && !addressUpdated) {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Une erreur est survenue, réessayez plus tard' });
            }

            return res.status(HttpStatus.OK).json({ message: 'Données personnelles mises à jour avec succès' });
        } catch (error) {
            if (error instanceof HttpException) {
                return res.status(error.getStatus()).json({ message: error.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Une erreur est survenue, réessayez plus tard' });
        }
    }
}


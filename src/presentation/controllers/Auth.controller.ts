import { Controller, Post, Body, Inject, HttpException, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from 'src/application/services/auth.service';
import { UserEntity } from 'src/domain/entities/User.entity';
import { AuthProvider } from 'src/domain/enums/AuthProvider';
import { UserRole } from 'src/domain/enums/UserRole.enum';
import { ApiProperty, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

export class SignUpDto {
    @ApiProperty({ example: 'user@email.com' })
    email: string;

    @ApiProperty({ example: 'motdepassefort' })
    password: string;
}

@ApiTags('auth')
@Controller()
export class AuthController {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService
    ) { }

    @ApiOperation({ summary: 'Créer un compte utilisateur' })
    @ApiResponse({ status: 201, description: 'Compte créé, veuillez vérifier votre email.' })
    @ApiResponse({ status: 409, description: 'Email déjà utilisé.' })
    @ApiResponse({ status: 500, description: 'Erreur serveur.' })
    @ApiBody({ type: SignUpDto })
    @Post('/auth/sign')
    async sign(@Body() signUpDto: SignUpDto, @Res() res: Response) {
        try {
            // Vérifier si l'utilisateur existe déjà
            const existing = await this.authService['userService'].findByEmail(signUpDto.email);
            if (existing) {
                return res.status(HttpStatus.CONFLICT).json({ message: 'Email déjà utilisé' });
            }
            // Créer l'utilisateur
            const user = new UserEntity();
            user.email = signUpDto.email;
            user.password = signUpDto.password;
            user.role = UserRole.CLIENT; // Par défaut, l'utilisateur est un utilisateur normal
            user.isEmailVerified = false;
            user.authProvider = AuthProvider.LOCAL;
            const created = await this.authService.sign(user);

            const tokens = this.authService.generateToken(created.id.toString(), created.email);
            // Stockage du refresh token dans un cookie sécurisé
            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                secure: false, // Passez à true en production
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
            });
            res.cookie("accessToken", tokens.accessToken, {
                httpOnly: true,
                secure: false, // Passez à true en production
                sameSite: "strict",
                maxAge: 60 * 60 * 1000, // 1 heure
            });

            return res.status(HttpStatus.CREATED).json({
                message: 'Compte créé, veuillez vérifier votre email',
                userId: created.id
            });
        } catch (error: any) {
            if (error instanceof HttpException) {
                return res.status(error.getStatus()).json({ message: error.message });
            }
            console.error('Erreur lors de la création du compte utilisateur:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Une erreur est survenue. Veuillez réessayer.' });
        }
    }
}

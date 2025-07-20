import { Controller, Post, Body, Inject, HttpException, HttpStatus, Res, Get, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthService } from 'src/application/services/auth.service';
import { UserEntity } from 'src/domain/entities/User.entity';
import { AuthProvider } from 'src/domain/enums/AuthProvider';
import { UserRole } from 'src/domain/enums/UserRole.enum';


import { ApiProperty, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PassportConfig } from 'src/application/config/passport.config';
import { LoginDto, SignUpDto } from '../dtos/Auth.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService,
        @Inject(PassportConfig) private readonly passportConfig: PassportConfig
    ) { }

    @ApiOperation({ summary: 'Créer un compte utilisateur' })
    @ApiResponse({ status: 201, description: 'Compte créé, veuillez vérifier votre email.' })
    @ApiResponse({ status: 409, description: 'Email déjà utilisé.' })
    @ApiResponse({ status: 500, description: 'Erreur serveur.' })
    @ApiBody({ type: SignUpDto })
    @Post('sign')
    async sign(@Body() signUpDto: SignUpDto, @Res() res: Response) {
        console.log('[AuthController] sign', { email: signUpDto.email });
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
                secure: process.env.ENV_NAME === 'development' ? false : true, // Passez à true en production
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
            });
            res.cookie("accessToken", tokens.accessToken, {
                httpOnly: true,
                secure: process.env.ENV_NAME === 'development' ? false : true, // Passez à true en production
                sameSite: "strict",
                maxAge: 10 * 60 * 60 * 1000, // 10 heure
            });

            console.log('tokens', tokens);
            const response = {
                message: 'Compte créé, veuillez vérifier votre email',
                userId: created.id,
                accessToken: tokens.accessToken
            };
            console.log('[AuthController] sign SUCCESS', response);
            return res.status(HttpStatus.CREATED).json(response);
        } catch (error: any) {
            if (error instanceof HttpException) {
                return res.status(error.getStatus()).json({ message: error.message });
            }
            console.error('[AuthController] sign ERROR', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Une erreur est survenue. Veuillez réessayer.' });
        }
    }

    @ApiOperation({ summary: 'Connexion utilisateur (email classique)' })
    @ApiResponse({ status: 201, description: 'Connexion réussie.' })
    @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
    @ApiResponse({ status: 401, description: 'Mot de passe incorrect.' })
    @ApiResponse({ status: 500, description: 'Erreur serveur.' })
    @ApiBody({ type: LoginDto })
    @Throttle({ login: { limit: 5, ttl: 60 } }) // applique la stratégie nommée 'login'
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        console.log('[AuthController] login', { email: loginDto.email });
        try {
            // 1. Chercher l'utilisateur par email
            const user = await this.authService['userService'].findByEmail(loginDto.email);
            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: "Utilisateur n'existe pas" });
            }

            // 2. Vérifier le mot de passe
            const isValid = await this.authService.comparePassword(loginDto.password, user.password);
            if (!isValid) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Mot de passe incorrect" });
            }

            // 3. Générer les tokens
            const tokens = this.authService.generateToken(user.id.toString(), user.email);

            // 4. Stocker les tokens dans des cookies sécurisés
            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.ENV_NAME === 'development' ? false : true, // Passez à true en production
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
            });
            res.cookie("accessToken", tokens.accessToken, {
                httpOnly: true,
                secure: process.env.ENV_NAME === 'development' ? false : true, // Passez à true en production
                sameSite: "strict",
                maxAge: 10 * 60 * 60 * 1000, // 10 heure
            });

            // 5. Retourner la réponse
            console.log('tokens', tokens);
            const response = {
                message: "Connexion au compte utilisateur",
                userId: user.id,
                accessToken: tokens.accessToken
            };
            console.log('[AuthController] login SUCCESS', response);
            return res.status(HttpStatus.CREATED).json(response);
        } catch (error: any) {
            if (error instanceof HttpException) {
                return res.status(error.getStatus()).json({ message: error.message });
            }
            console.error('[AuthController] login ERROR', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Une erreur est survenue. Veuillez réessayer.' });
        }
    }

    @ApiOperation({ summary: 'Connexion/Création via Google OAuth' })
    @ApiResponse({ status: 201, description: 'Connexion/Création réussie.' })
    @ApiResponse({ status: 401, description: 'Token Google invalide.' })
    @ApiBody({})
    @Post('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Passport redirige automatiquement vers Google
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(@Req() req: Request, @Res() res: Response) {
        console.log('[AuthController] googleCallback', { user: req.user });
        try {
            const user = req.user;
            const tokens = this.authService.generateToken(user['id'].toString(), user['email']);
            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.ENV_NAME === 'development' ? false : true, // Passe à true en production
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.cookie("accessToken", tokens.accessToken, {
                httpOnly: true,
                secure: process.env.ENV_NAME === 'development' ? false : true,
                sameSite: "strict",
                maxAge: 60 * 60 * 1000,
            });
            // Redirige vers le frontend (à adapter selon ton besoin)
            console.log('tokens', tokens);
            console.log('[AuthController] googleCallback SUCCESS', { user });
            return res.redirect('/');
        } catch (error) {
            console.error('[AuthController] googleCallback ERROR', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la connexion Google' });
        }
    }

    @Post('refresh')
    async refreshToken(@Req() req: Request, @Res() res: Response) {
        console.log('[AuthController] refreshToken', { cookies: req.cookies });
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) return res.sendStatus(401);

            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new Error('JWT_SECRET environment variable is not defined');
            }

            jwt.verify(refreshToken, jwtSecret, (err: any, user: any) => {
                if (err) return res.sendStatus(403);

                const accessToken = this.authService.generateAccessToken(user.id, user.email);

                res.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    secure: process.env.ENV_NAME === 'development' ? false : true, // Passez à true en production
                    sameSite: "strict",
                    maxAge: 60 * 60 * 1000, // 1 heure
                });

                console.log('tokens', accessToken);
                console.log('[AuthController] refreshToken SUCCESS', { user });
                res.status(200).json({ message: "success" });
            });
        } catch (error) {
            console.error('[AuthController] refreshToken ERROR', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors du refresh token' });
        }
    }

    @Post('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
        console.log('[AuthController] logout', { user: req.user });
        try {
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            console.log('[AuthController] logout SUCCESS');
            res.status(200).json({ message: "Déconnexion réussie" });
        } catch (error) {
            console.error('[AuthController] logout ERROR', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la déconnexion' });
        }
    }

    @Throttle({ reset: { limit: 3, ttl: 60 } }) // applique la stratégie nommée 'reset'
    @Post('reset-password')
    async resetPassword(@Body() dto: any, @Res() res: Response) {
        // ... logique de reset password à compléter ...
        return res.status(200).json({ message: 'Si cet email existe, un lien a été envoyé.' });
    }
}
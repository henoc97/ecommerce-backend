import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as passport from 'passport';
import * as dotenv from 'dotenv';
import { AuthProvider } from 'src/domain/enums/AuthProvider';
import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserEntity } from 'src/domain/entities/User.entity';
import { AddressEntity } from 'src/domain/entities/Address.entity';
import { AddressService } from '../services/address.service';

dotenv.config();


interface JwtPayload {
    id: string; // Adjust the type according to your user ID type
}

@Injectable()
export class PassportConfig {
    constructor(
        @Inject(UserService) private readonly userService: UserService,
        @Inject(AddressService) private readonly addressService: AddressService
    ) {
        // Ensure that the JWT secret is defined
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }

        // Configuration de la stratégie JWT
        const jwtOptions = {
            jwtFromRequest: ExtractJwt.fromExtractors([
                // 1. Depuis le cookie 'accessToken'
                (req) => req?.cookies?.accessToken || null,
                // 2. (optionnel) Depuis l'en-tête Authorization classique
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            secretOrKey: jwtSecret, // Now guaranteed to be a string
        };

        // Update VerifyCallback to accept User
        type CustomVerifyCallback = (error: any, user?: UserEntity | false, info?: any) => void;

        passport.use(new JwtStrategy(jwtOptions, async (jwtPayload: JwtPayload, done: CustomVerifyCallback) => {
            try {
                const user = await userService.findById(Number(jwtPayload.id));
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            } catch (error) {
                return done(error, false);
            }
        }));

        // Ensure that the environment variables are defined
        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

        if (!googleClientId || !googleClientSecret) {
            throw new Error('Missing Google Client ID or Client Secret');
        }

        // Configuration de la stratégie Google
        passport.use(new GoogleStrategy({
            clientID: googleClientId,
            clientSecret: googleClientSecret,
            callbackURL: 'http://localhost:5000/api/auth/google/callback',
            scope: ['profile', 'email'],
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                // console.log('Google Profile:', profile);
                // console.log('Access Token:', accessToken);
                // console.log('Refresh Token:', refreshToken);

                // Vérifier si l'utilisateur existe déjà
                let _user = await userService.signInWithGoogle(profile.id);
                if (_user) {
                    return done(null, _user);
                }

                // Créer un nouvel utilisateur
                let user: Partial<UserEntity> = {
                    googleId: profile.id,
                    name: profile.displayName,
                    isEmailVerified: true,
                    authProvider: AuthProvider.GOOGLE,
                    email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '',
                };
                const userCreated = await userService.createUser(user as UserEntity);
                const address = {
                    userId: userCreated.id,
                    street: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: ''
                } as AddressEntity;
                // Create address for the user
                await this.addressService.createAddress(address)
                return done(null, userCreated);
            } catch (error) {
                return done(error, false);
            }
        }));

        passport.serializeUser((user, done) => {
            done(null, (user as any)._id); // Utilisez l'ID de l'utilisateur pour la sérialisation
        });

        passport.deserializeUser(async (id, done) => {
            try {
                const user = await userService.findById(Number(id)); // Utilisez votre modèle utilisateur ici
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        });
    }
}

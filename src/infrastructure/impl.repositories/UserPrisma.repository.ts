import prisma from '../../../prisma/client/prisma.service';
import { UserEntity } from '../../domain/entities/User.entity';
import { IUserRepository, IConsentPreferences } from '../../domain/repositories/User.repository';
import { Prisma, UserRole as PrismaUserRole } from '@prisma/client';

export class UserPrismaRepository implements IUserRepository {
    async createUser(data: UserEntity): Promise<UserEntity> {
        try {
            const user = await prisma.user.create({ data: data as Prisma.UserCreateInput });
            return user as UserEntity;
        } catch (error) {
            throw error;
        }
    }
    async findByEmail(email: string): Promise<UserEntity> {
        try {
            return await prisma.user.findUnique({ where: { email } }) as UserEntity;
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number): Promise<UserEntity> {
        try {
            return await prisma.user.findUnique({ where: { id } }) as UserEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateUser(id: number, data: Partial<UserEntity>): Promise<UserEntity> {
        try {
            const updateData = { ...data };
            if (updateData.role) updateData.role = updateData.role as PrismaUserRole;
            return await prisma.user.update({ where: { id }, data: updateData as Prisma.UserUpdateInput }) as UserEntity;
        } catch (error) {
            throw error;
        }
    }
    async deleteUser(id: number): Promise<void> {
        try {
            await prisma.user.delete({ where: { id } });
        } catch (error) {
            throw error;
        }
    }
    async listUsers(filter?: Partial<UserEntity>): Promise<UserEntity[]> {
        try {
            return await prisma.user.findMany({ where: filter as Prisma.UserWhereInput }) as UserEntity[];
        } catch (error) {
            throw error;
        }
    }
    async disableUser(id: number): Promise<void> {
        try {
            await prisma.user.update({ where: { id }, data: { isEmailVerified: false } });
        } catch (error) {
            throw error;
        }
    }
    async signIn(email: string, password: string): Promise<UserEntity> {
        try {
            return await prisma.user.findUnique({ where: { email, password } }) as UserEntity;
        } catch (error) {
            throw error;
        }
    }
    async signInWithGoogle(googleId: string): Promise<UserEntity> {
        try {
            return await prisma.user.findUnique({ where: { googleId } }) as UserEntity;
        } catch (error) {
            throw error;
        }
    }
    async setRole(id: number, role: string): Promise<void> {
        try {
            await prisma.user.update({ where: { id }, data: { role: role as PrismaUserRole } });
        } catch (error) {
            throw error;
        }
    }

    async forceLogout(userId: number): Promise<void> {
        try {
            await prisma.user.update({ where: { id: userId }, data: { authProvider: 'FORCED_LOGOUT' } });
        } catch (error) {
            throw error;
        }
    }

    async deleteSensitiveData(userId: number): Promise<void> {
        try {
            // Suppression des notifications
            await prisma.notification.deleteMany({ where: { userId } });
            // Suppression des adresses
            await prisma.address.deleteMany({ where: { userId } });
            // Suppression des paniers
            await prisma.cart.deleteMany({ where: { userId } });
            // Suppression des tickets
            await prisma.ticket.deleteMany({ where: { userId } });
            // Suppression des reviews
            await prisma.review.deleteMany({ where: { userId } });
            // Suppression des logs d'activité
            await prisma.userActivity.deleteMany({ where: { userId } });
            // Suppression des logs d'audit
            await prisma.auditLog.deleteMany({ where: { userId } });
            // (Optionnel) Désactive le compte utilisateur
            await prisma.user.update({ where: { id: userId }, data: { isEmailVerified: false } });
        } catch (error) {
            throw error;
        }
    }

    // GDPR - Gestion du consentement
    async updateConsentPreferences(userId: number, preferences: IConsentPreferences): Promise<void> {
        try {
            // Sérialiser les préférences en JSON avec conversion explicite
            const jsonPreferences = {
                marketing: preferences.marketing,
                analytics: preferences.analytics,
                necessary: preferences.necessary,
                preferences: preferences.preferences,
                lastUpdated: preferences.lastUpdated.toISOString()
            };

            await prisma.user.update({
                where: { id: userId },
                data: {
                    consentPreferences: jsonPreferences
                }
            });
        } catch (error) {
            throw error;
        }
    }

    async getConsentPreferences(userId: number): Promise<IConsentPreferences | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { consentPreferences: true }
            });

            if (!user?.consentPreferences) {
                return null;
            }

            // Validation et conversion du JSON vers IConsentPreferences
            const preferences = user.consentPreferences as any;

            // Vérifier que c'est un objet avec les propriétés requises
            if (typeof preferences === 'object' && preferences !== null) {
                const validPreferences: IConsentPreferences = {
                    marketing: Boolean(preferences.marketing),
                    analytics: Boolean(preferences.analytics),
                    necessary: Boolean(preferences.necessary),
                    preferences: Boolean(preferences.preferences),
                    lastUpdated: preferences.lastUpdated ? new Date(preferences.lastUpdated) : new Date()
                };

                return validPreferences;
            }

            return null;
        } catch (error) {
            throw error;
        }
    }
} 
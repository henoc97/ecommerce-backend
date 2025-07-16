import prisma from '../../../prisma/client/prisma.service';
import { UserEntity } from '../../domain/entities/User.entity';
import { IUserRepository } from '../../domain/repositories/User.repository';
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
} 
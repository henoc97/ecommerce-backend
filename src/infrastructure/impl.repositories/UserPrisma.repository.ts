import prisma from '../../../prisma/client/prisma.service';
import { UserEntity } from '../../domain/entities/User.entity';
import { IUserRepository } from '../../domain/repositories/User.repository';

export class UserPrismaRepository implements IUserRepository {
    async createUser(data: UserEntity): Promise<UserEntity> {
        try {
            const user = await prisma.user.create({ data });
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
            return await prisma.user.update({ where: { id }, data }) as UserEntity;
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
            return await prisma.user.findMany({ where: filter }) as UserEntity[];
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
            await prisma.user.update({ where: { id }, data: { role } });
        } catch (error) {
            throw error;
        }
    }
} 
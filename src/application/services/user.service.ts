import { Injectable, Inject } from '@nestjs/common';
import { UserPrismaRepository } from '../../infrastructure/impl.repositories/UserPrisma.repository';
import { UserEntity } from '../../domain/entities/User.entity';
import { comparePassword } from '../helper/hash-compare-pwd';

@Injectable()
export class UserService {
    constructor(
        @Inject(UserPrismaRepository) private readonly repository: UserPrismaRepository,
    ) { }

    async createUser(data: UserEntity) {
        try {
            return await this.repository.createUser(data);
        } catch (error) {
            throw error;
        }
    }
    async findByEmail(email: string) {
        try {
            return await this.repository.findByEmail(email);
        } catch (error) {
            throw error;
        }
    }
    async findById(id: number) {
        try {
            return await this.repository.findById(id);
        } catch (error) {
            throw error;
        }
    }
    async updateUser(id: number, data: Partial<UserEntity>) {
        try {
            return await this.repository.updateUser(id, data);
        } catch (error) {
            throw error;
        }
    }
    async deleteUser(id: number) {
        try {
            return await this.repository.deleteUser(id);
        } catch (error) {
            throw error;
        }
    }
    async listUsers(filter?: Partial<UserEntity>) {
        try {
            return await this.repository.listUsers(filter);
        } catch (error) {
            throw error;
        }
    }
    async disableUser(id: number) {
        try {
            return await this.repository.disableUser(id);
        } catch (error) {
            throw error;
        }
    }
    async signIn(email: string, password: string) {
        try {
            return await this.repository.signIn(email, password);
        } catch (error) {
            throw error;
        }
    }
    async signInWithGoogle(googleId: string) {
        try {
            return await this.repository.signInWithGoogle(googleId);
        } catch (error) {
            throw error;
        }
    }
    async setRole(id: number, role: string) {
        try {
            return await this.repository.setRole(id, role);
        } catch (error) {
            throw error;
        }
    }
    async validateUserPassword(user: any, password: string): Promise<boolean> {
        return user?.password ? await comparePassword(password, user.password) : false;
    }
    async forceLogout(userId: number) {
        try {
            return await this.repository.forceLogout(userId);
        } catch (error) {
            throw error;
        }
    }
    async deleteSensitiveData(userId: number) {
        try {
            return await this.repository.deleteSensitiveData(userId);
        } catch (error) {
            throw error;
        }
    }
} 
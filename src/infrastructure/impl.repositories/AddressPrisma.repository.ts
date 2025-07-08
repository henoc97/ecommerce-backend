import { Prisma, Address as PrismaAddress } from '@prisma/client';
import prisma from '../../../prisma/client/prisma.service';
import { AddressEntity } from '../../domain/entities/Address.entity';
import { IAddressRepository } from '../../domain/repositories/Address.repository';

export class AddressPrismaRepository implements IAddressRepository {
    async createAddress(data: AddressEntity): Promise<AddressEntity> {
        try {
            return await prisma.address.create({ data: data as Prisma.AddressCreateInput }) as AddressEntity;
        } catch (error) {
            throw error;
        }
    }
    async updateAddress(userId: number, data: AddressEntity): Promise<AddressEntity> {
        try {
            return await prisma.address.update({ where: { userId }, data: data as Prisma.AddressUpdateInput }) as AddressEntity;
        } catch (error) {
            throw error;
        }
    }
    async findByUserId(userId: number): Promise<AddressEntity> {
        try {
            return await prisma.address.findUnique({ where: { userId } }) as AddressEntity;
        } catch (error) {
            throw error;
        }
    }
    async findAllAddresses(userId: number): Promise<AddressEntity[]> {
        try {
            return await prisma.address.findMany({ where: { userId } }) as AddressEntity[];
        } catch (error) {
            throw error;
        }
    }
    async deleteAddress(userId: number): Promise<void> {
        try {
            await prisma.address.delete({ where: { userId } });
        } catch (error) {
            throw error;
        }
    }
} 
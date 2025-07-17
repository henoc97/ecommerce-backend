import prisma from '../../../prisma/client/prisma.service';
import { VendorEntity } from '../../domain/entities/Vendor.entity';
import { ShopEntity } from '../../domain/entities/Shop.entity';
import { IVendorRepository } from '../../domain/repositories/Vendor.repository';
import { Prisma } from '@prisma/client';

export class VendorPrismaRepository implements IVendorRepository {
    async createVendor(userId: number): Promise<VendorEntity> {
        try {
            return await prisma.vendor.create({ data: { userId } }) as VendorEntity;
        } catch (error) {
            throw error;
        }
    }
    async findByUserId(userId: number): Promise<VendorEntity> {
        try {
            return await prisma.vendor.findUnique({
                where: { userId } as Prisma.VendorWhereUniqueInput,
                include: { shops: true }
            }) as VendorEntity;
        } catch (error) {
            throw error;
        }
    }
    async listVendors(): Promise<VendorEntity[]> {
        try {
            return await prisma.vendor.findMany() as VendorEntity[];
        } catch (error) {
            throw error;
        }
    }
    async getVendorShops(vendorId: number): Promise<ShopEntity[]> {
        try {
            return await prisma.shop.findMany({ where: { vendorId } as Prisma.ShopWhereInput }) as ShopEntity[];
        } catch (error) {
            throw error;
        }
    }
} 
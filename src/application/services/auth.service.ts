import { AddressEntity } from 'src/domain/entities/Address.entity';
import { UserEntity } from '../../domain/entities/User.entity';
import { hashPassword, comparePassword } from '../helper/hash-compare-pwd';
import { AddressService } from './address.service';
import { UserService } from './user.service';
import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
    constructor(
        @Inject(UserService) private readonly userService: UserService,
        @Inject(AddressService) private readonly addressService: AddressService
    ) { }

    public async sign(user: UserEntity) {
        user.password = await hashPassword(user.password!);
        const userCreated = await this.userService.createUser(user);
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
        console.log("user", JSON.stringify(userCreated));
        return userCreated;
    }

    public async login(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        console.log("user", JSON.stringify(user));
        console.log('this.userService.validateUserPassword(user, password)', await this.userService.validateUserPassword(user, password));
        if (!user || !(await this.userService.validateUserPassword(user, password))) {
            throw new Error('Invalid credentials');
        }
        return user;
    }

    /**
     * 
     * @param userId 
     * @param email 
     * @returns { accessToken, refreshToken }
     */
    public generateToken(userId: string, email: string): { accessToken: string, refreshToken: string } {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }
        const accessToken = jwt.sign({ id: userId, email }, jwtSecret, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: userId, email }, jwtSecret, { expiresIn: '7d' });
        const tokens = { accessToken, refreshToken };
        return tokens;
    }

    /**
     * 
     * @param userId 
     * @param email 
     * @returns accesToken: string
     */
    public generateAccessToken(userId: string, email: string): string {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }
        const accessToken = jwt.sign({ id: userId, email: email }, jwtSecret, { expiresIn: '1h' });
        return accessToken;
    }

    async comparePassword(password: string, passwordHashed: string): Promise<boolean> {
        return comparePassword(password, passwordHashed);
    }
}


import jwt from 'jsonwebtoken';
import userService from './user.service';
import { UserEntity } from '../../domain/entities/User.entity';
import { hashPassword } from '../helper/hash-compare-pwd';

class AuthService {
    private static instance: AuthService;

    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public async sign(user: UserEntity) {
        user.password = await hashPassword(user.password!);
        const userCreated = await userService.create(user);
        console.log("user", JSON.stringify(userCreated));
        return userCreated;
    }


    public async login(email: string, password: string) {
        const user = await userService.findByEmail(email);
        console.log("user", JSON.stringify(user));
        console.log('userService.validateUserPassword(user, password)', await userService.validateUserPassword(user, password));
        if (!user || !(await userService.validateUserPassword(user, password))) {
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
        const accessToken = jwt.sign({ id: userId, email: email }, jwtSecret, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: userId, email: email }, jwtSecret, { expiresIn: '7d' });
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
}

export default AuthService.getInstance(); 
import jwt from 'jsonwebtoken';
import { SECRET_KEY, REFRESH_TOKEN_SECRET } from '../config/env.js';
import { UserService } from './UserService.js';

interface JWTPayload {
    login: string;
    id: number;
    iat?: number;
    exp?: number;
}

export class JWTService {
    static cryptData(payload: JWTPayload, secretKey: string, _expiresIn: string): string {
        // @ts-ignore
        return jwt.sign(payload, secretKey, { expiresIn: _expiresIn });
    }

    static decryptToken(token: string, secretKey: string): JWTPayload | null {
        try {
            return jwt.verify(token, secretKey) as JWTPayload;
        } catch (error) {
            console.error('Erreur de décodage du token:', error);
            return null;
        }
    }

    static async refreshToken(token: string, _secretKey: string): Promise<string | null> {
        try {
            const decoded = this.decryptToken(token, REFRESH_TOKEN_SECRET);
            if (!decoded) {
                console.error('Token non décodé');
                return null;
            }

            const user = await UserService.selectUserByLogin(decoded.login);
            
            if (!user || user.id !== decoded.id) {
                console.error('Utilisateur non trouvé ou ID incorrect');
                return null;
            }

            return this.cryptData(
                { login: user.login, id: user.id },
                SECRET_KEY,
                "15m"
            );
        } catch (error) {
            console.error('Erreur de refresh token:', error);
            return null;
        }
    }
}
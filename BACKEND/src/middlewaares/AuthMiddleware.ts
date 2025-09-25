import { Request, Response, NextFunction } from "express";
import { JWTService } from "../services/JWTService.js";
import { TaskService } from "../services/TaskService.js";
import { HttpStatusCode } from "../enum/StatusCode.js";
import { ErrorsMessagesFr } from "../enum/ErrorsMessagesFr.js";
import { PermissionUserTacheService } from "../services/PermissionUserTacheService.js";
import { Permission } from "@prisma/client";
import { SECRET_KEY as Secret_Key } from "../config/env.js";

export class AuthMiddleware {
    static authenticateUser(req: Request, res: Response, next: NextFunction) {
        // Autoriser les requêtes préflight OPTIONS
        if (req.method === 'OPTIONS') {
            console.log('Requête OPTIONS autorisée');
            return next();
        }

        console.log('=== AUTHENTIFICATION ===');
        console.log('Méthode:', req.method);
        console.log('URL:', req.url);
        console.log('Headers reçus:', JSON.stringify(req.headers, null, 2));
        const authHeader = req.headers.authorization;
        console.log('Auth Header:', authHeader);

        if (!authHeader) {
            return res.status(HttpStatusCode.UNAUTHORIZED).json({
                success: false,
                error: ErrorsMessagesFr.TOKEN_MANQUANT
            });
        }

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(HttpStatusCode.UNAUTHORIZED).json({
                success: false,
                error: "Le format du token doit être: Bearer <token>"
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token extrait:', token ? 'Token présent (longueur: ' + token!.length + ')' : 'Token absent');

        if (!token) {
            return res.status(HttpStatusCode.UNAUTHORIZED).json({
                success: false,
                error: ErrorsMessagesFr.TOKEN_MANQUANT
            });
        }

        try {
            console.log('Token reçu pour validation:', token);
            const decoded = JWTService.decryptToken(token, Secret_Key);
            console.log('Décodage du token:', decoded ? ' Succès' : ' Échec', decoded);

            if (typeof decoded === "object" && decoded !== null && "login" in decoded) {
                req.user = decoded as { login: string; id: number };
                console.log(' Utilisateur authentifié:', req.user.login, '(ID:', req.user.id + ')');
                return next();
            } else {
                return res.status(HttpStatusCode.FORBIDDEN).json({
                    success: false,
                    error: ErrorsMessagesFr.TOKEN_INVALIDE
                });
            }
        } catch (err) {
            return res.status(HttpStatusCode.FORBIDDEN).json({
                success: false,
                error: ErrorsMessagesFr.TOKEN_INVALIDE
            });
        }
    }

    static async authorizeModification(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const task = await TaskService.findById(id);
            console.log(`AuthorizeModification: req.user?.id=${req.user?.id}, task.userId=${task.userId}`);
            if (Number(req.user?.id) === task.userId) {
                return next()
            }
            return AuthMiddleware.authorizePermission(req, res, next);
        } catch (err) {
            next(err);
        }
    }

    static async authorizePermission(req: Request, res: Response, next: NextFunction){
        try {
            const id = Number(req.params.id);
            const userId = req.user?.id;
            const method = req.method as Permission;

            const permission = await PermissionUserTacheService.findById(id, userId, method)
            if(!permission) throw {status: HttpStatusCode.FORBIDDEN, message: ErrorsMessagesFr.FORBIDDEN_ACTION};
            next()
        } catch (err) {
            next(err)
        }
    }
}
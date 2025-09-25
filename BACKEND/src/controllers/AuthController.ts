import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/TaskService.js';
import { SECRET_KEY, ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN } from '../config/env.js';
import bcrypt from "bcryptjs";
import { UserService } from '../services/UserService.js';
import { HttpStatusCode } from '../enum/StatusCode.js';
import { JWTService } from '../services/JWTService.js';
import { ErrorsMessagesFr } from '../enum/ErrorsMessagesFr.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Route /register appelée');
      console.log('Body reçu:', req.body);
      const { nom, login, password } = req.body;
      
      // Vérification des champs obligatoires
      if (!nom || !login || !password) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          error: "Tous les champs (nom, login, password) sont obligatoires"
        });
      }

      

      // Validation supplémentaire
      if (nom.length < 2) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          error: "Le nom doit contenir au moins 2 caractères"
        });
      }

      if (login.length < 3) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          error: "Le login doit contenir au moins 3 caractères"
        });
      }

      if (password.length < 6) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          error: "Le mot de passe doit contenir au moins 6 caractères"
        });
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await UserService.selectUserByLogin(login);
      if (existingUser) {
        return res.status(HttpStatusCode.CONFLICT).json({
          error: "Un utilisateur avec ce login existe déjà"
        });
      }

      // Hasher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Créer le nouvel utilisateur
      const newUser = await UserService.create({
        nom,
        login,
        password: hashedPassword
      });

      // Envoyer la réponse sans tokens
      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: "Inscription réussie. Veuillez vous connecter.",
        user: {
          id: newUser.id,
          nom: newUser.nom,
          login: newUser.login
        }
      });
    } catch (err) {
      next(err);
    }
  }
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { login, password } = req.body;
      
      if (!login || !password) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          error: ErrorsMessagesFr.INVALID_INPUT
        });
      }

      const user = await UserService.selectUserByLogin(login);
      
      if (!user) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          error: ErrorsMessagesFr.INCORRECT_CREDENTIALS
        });
      }

      

      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          error: ErrorsMessagesFr.INCORRECT_CREDENTIALS
        });
      }

      const accessToken = JWTService.cryptData(
        { login: user.login, id: user.id },
        SECRET_KEY,
        ACCESS_EXPIRES_IN
      );

      const refreshToken = JWTService.cryptData(
        { login: user.login, id: user.id },
        SECRET_KEY,
        REFRESH_EXPIRES_IN
      );

      return res.status(HttpStatusCode.OK).json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          nom: user.nom
        }
      });
      
    } catch (error) {
      console.error('Erreur de login:', error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        error: ErrorsMessagesFr.ERREUR_INTERNE
      });
    }
  };

  static async refresh (req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token manquant" });
    const newAccesToken = await JWTService.refreshToken(token, SECRET_KEY);
    if (!newAccesToken) return res.status(401).json({ error: "Token invalide" });
    return res.json({accessToken: newAccesToken})
  }
}
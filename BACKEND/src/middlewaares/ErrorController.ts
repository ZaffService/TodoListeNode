import { Request, Response, NextFunction } from "express";
import { ErrorsMessagesFr } from "../enum/ErrorsMessagesFr.js";

export class ErrorController
{
    static handle(err: any, req: Request, res: Response, next: NextFunction){
        // Gestion spécifique des erreurs Multer
        if (err instanceof Error && err.message.includes('Format de message vocal non supporté')) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }

        if (err instanceof Error && err.message.includes('Champ de fichier non reconnu')) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }

        if (err instanceof Error && err.message.includes('Format de fichier image non supporté')) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }

        // Gestion des erreurs de limite de taille Multer
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'Fichier trop volumineux. Taille maximale autorisée: 50MB'
            });
        }

        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Trop de fichiers envoyés'
            });
        }

        if (err.code === 'LIMIT_FIELD_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'Champ de formulaire trop volumineux'
            });
        }

        // Erreur par défaut
        res.status(err.status || 500).json({
            success: false,
            error: err.message || ErrorsMessagesFr.ERREUR_INTERNE
        })
    }
}

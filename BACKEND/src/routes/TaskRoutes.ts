import express, { Router } from "express";
import { TaskController } from "../controllers/TaskController.js";
import { AuthMiddleware } from "../middlewaares/AuthMiddleware.js";
import multer from'multer';
import { HistoriqueModifTacheController } from "../controllers/HistoriqueModifTacheController.js";

import fs from 'fs';
import path from 'path';

// Créer le dossier temporaire s'il n'existe pas
const tempDir = path.join(process.cwd(), 'uploads/temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('✅ Dossier temporaire créé:', tempDir);
}

// Configuration Multer simplifiée pour les uploads temporaires vers Cloudinary
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir); // Dossier temporaire pour les fichiers avant upload Cloudinary
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB pour les fichiers vocaux
        files: 2, // Maximum 2 fichiers (image + voiceMessage)
        fieldSize: 10 * 1024 * 1024 // 10MB pour les champs texte
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'voiceMessage') {
            const allowedMimeTypes = [
                'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav',
                'audio/mpeg', 'audio/mp3', 'audio/mpeg3', 'audio/x-mpeg-3',
                'video/mpeg', 'application/octet-stream'
            ];

            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error(`Format de message vocal non supporté: ${file.mimetype}`));
            }
        } else if (file.fieldname === 'image') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Format de fichier image non supporté'));
            }
        } else {
            cb(new Error(`Champ de fichier non reconnu: ${file.fieldname}`));
        }
    }
});

const router = Router();

// Routes GET (lecture) - pas besoin d'authentification supplémentaire
router.get("/",  TaskController.getAll);
router.get("/:id",  TaskController.getOne);
router.get("/:id/historique",  HistoriqueModifTacheController.getAllModif);

// Routes POST (création) - multer seulement si multipart, sinon JSON direct
router.post("/", AuthMiddleware.authenticateUser, (req, res, next) => {
    if (req.headers['content-type']?.includes('multipart/form-data')) {
        upload.fields([
            { name: 'image', maxCount: 1 },
            { name: 'voiceMessage', maxCount: 1 }
        ])(req, res, next);
    } else {
        next();
    }
}, TaskController.create);

// Routes PATCH et DELETE (modification/suppression) - besoin d'autorisation supplémentaire
router.patch("/:id", AuthMiddleware.authenticateUser, AuthMiddleware.authorizeModification, TaskController.update);
router.patch("/:id/markDone", AuthMiddleware.authenticateUser, AuthMiddleware.authorizeModification, TaskController.updateStatusDone);
router.patch("/:id/markUndone", AuthMiddleware.authenticateUser, AuthMiddleware.authorizeModification, TaskController.updateStatusUndone);
router.delete("/:id", AuthMiddleware.authenticateUser, AuthMiddleware.authorizeModification, TaskController.delete);

// Nouveau endpoint pour compter les tâches terminées
router.get("/count/completed", AuthMiddleware.authenticateUser, TaskController.countCompleted);

export default router;

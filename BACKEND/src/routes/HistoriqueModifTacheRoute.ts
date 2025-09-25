import express, { Router } from "express";
import { PermissionUserTacheController } from "../controllers/PermissionUserTacheController.js";
import { AuthMiddleware } from "../middlewaares/AuthMiddleware.js";
import { HistoriqueModifTacheController } from "../controllers/HistoriqueModifTacheController.js";

const router = Router();

router.get("/:id/historique",  HistoriqueModifTacheController.getAllModif);
router.delete("/:userId/:tacheId/:permission",  PermissionUserTacheController.delete);

export default router

import express, { Router } from "express";
import { PermissionUserTacheController } from "../controllers/PermissionUserTacheController.js";
import { AuthMiddleware } from "../middlewaares/AuthMiddleware.js";

const router = Router();

router.post("/:id", AuthMiddleware.authenticateUser, PermissionUserTacheController.create);
router.delete("/:userId/:tacheId/:permission", AuthMiddleware.authenticateUser, PermissionUserTacheController.delete);

export default router

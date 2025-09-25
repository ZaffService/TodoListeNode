import { Request, Response, NextFunction } from 'express';
import { PermissionUserTacheService } from "../services/PermissionUserTacheService.js";
import { PermissionSchema } from '../models/PermissionModel.js';
import { Permission } from '@prisma/client';
import { ReponseFormatter } from '../middlewaares/ReponseFormatter.js';
import { SuccessCodes } from '../enum/SuccesCodesFr.js';
import { TaskService } from '../services/TaskService.js';
import { UserService } from '../services/UserService.js';
import { HttpStatusCode } from '../enum/StatusCode.js';
import { ErrorsMessagesFr } from '../enum/ErrorsMessagesFr.js';

export class PermissionUserTacheController
{
    static async create(req: Request, res: Response, next: NextFunction){
        try {
            const id = Number (req.params.id)
            const tache = await TaskService.findById(id);
            if (Number(req.user?.id) !== tache.userId) {
                throw { status: HttpStatusCode.FORBIDDEN, message: ErrorsMessagesFr.FORBIDDEN_ACTION };
            }
            const data = PermissionSchema.parse(req.body)
            const user = await UserService.selectUserById(data.userId)
            if(user.id === tache.userId) throw { status: HttpStatusCode.BAD_REQUEST, message: ErrorsMessagesFr.NOT_ON_Your_OWN_TASK };
            const permission = await PermissionUserTacheService.findById(id, data.userId, data.permission.toUpperCase() as Permission)
            if(permission) throw { status: HttpStatusCode.BAD_REQUEST, message: ErrorsMessagesFr.ALREADY_GIVEN };
            const OMPermission = {permission:(data.permission).toUpperCase() as Permission, userId: data.userId, tacheId: id }
            const newPermission = await PermissionUserTacheService.create(OMPermission)
            return ReponseFormatter.success(res, newPermission, SuccessCodes.PERMISSION_GRANTED)
        } catch (err) {
            next(err)
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction){
        try {
            const userId = Number (req.params.userId)
            const permission = req.params.permission?.toUpperCase() as Permission
            const tacheId = Number (req.params.tacheId)
            const tache = await TaskService.findById(tacheId);
            if (Number(req.user?.id) !== tache.userId) {
                throw { status: HttpStatusCode.FORBIDDEN, message: ErrorsMessagesFr.FORBIDDEN_ACTION };
            }
            await PermissionUserTacheService.delete({userId, permission, tacheId})
            return ReponseFormatter.success(res, null, SuccessCodes.PERMISSION_REMOVED)
        } catch (err) {
            next(err)
        }
    }
}
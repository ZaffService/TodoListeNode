import prisma from "../config/prisma.js";
import { HttpStatusCode } from "../enum/StatusCode.js";
import { ErrorsMessagesFr } from "../enum/ErrorsMessagesFr.js";
import type { Permission, PermissionUserTache } from "@prisma/client";

export class PermissionUserTacheService
{
    static async findById(tacheId: number, userId: number, permission: Permission): Promise<PermissionUserTache | null> {
        const foundPermission = await prisma.permissionUserTache.findFirst({ where: { userId, tacheId, permission } });
        return foundPermission;
    }

    static async create(data: Omit<PermissionUserTache, "id">): Promise<PermissionUserTache>{
        return await prisma.permissionUserTache.create({data})
    }

    static async delete(data: Omit<PermissionUserTache, "id">){
        const permission = await prisma.permissionUserTache.findFirst({where: {userId: data.userId, permission: data.permission, tacheId: data.tacheId}})
        if (!permission) throw {status: HttpStatusCode.NOT_FOUND, message: ErrorsMessagesFr.PERMISSION_NOTFOUND}
        return await prisma.permissionUserTache.delete({where: {id: permission.id}})
    }
}
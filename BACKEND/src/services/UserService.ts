import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import { ErrorsMessagesFr } from "../enum/ErrorsMessagesFr.js";
import { HttpStatusCode } from "../enum/StatusCode.js";
import { User } from "@prisma/client";

export class UserService
{
  static async create(data: { nom: string; login: string; password: string }): Promise<User> {
    return await prisma.user.create({
      data: {
        nom: data.nom,
        login: data.login,
        password: data.password
      }
    });
  }
  static async selectUserByLogin(login: string): Promise<User | null> {
    return await prisma.user.findUnique({
        where: {login}
    });
  }

    static async selectUserById(id: number): Promise<User> {
    const user =  await prisma.user.findUnique({
        where: {id}
    });
    if (!user) throw { status: HttpStatusCode.BAD_REQUEST, message: ErrorsMessagesFr.USER_NOT_FOUND };
    return user;
  }
}

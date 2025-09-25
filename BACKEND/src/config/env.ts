import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;


export const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET as string;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || "15m";
export const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "7d";
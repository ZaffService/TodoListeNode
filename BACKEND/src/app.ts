import express, {Request , Response}  from "express";
import multer from'multer';
import path from 'path';
import cors from 'cors';
import TaskRoutes from "./routes/TaskRoutes.js"
import { ErrorController } from "./middlewaares/ErrorController.js";
import AuthRoutes from './routes/authRoutes.js';
import PermissionRoutes from './routes/permissionRoute.js'
import { AuthMiddleware } from "./middlewaares/AuthMiddleware.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.join(process.cwd(), "uploads"); 

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
}));


 
// Middleware pour gérer les requêtes OPTIONS (CORS preflight) et les uploads multipart
app.use('/api', (req: Request, res: Response, next: any) => {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.sendStatus(200);
    } else {
        next();
    }
});

// Body parsers (appliqués toujours, multer gère le multipart séparément)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/' , (req: Request , res: Response) => {
    res.send('API TODO LIST en marche ...');
})

// Routes publiques
app.use("/api/auth", AuthRoutes);
app.use('/uploads', express.static(uploadPath));

// Routes protégées - multer doit être appliqué avant l'authentification pour les uploads
app.use('/api/tasks', TaskRoutes);
app.use('/api/grantpermission', PermissionRoutes)

app.use(ErrorController.handle)

export default app;
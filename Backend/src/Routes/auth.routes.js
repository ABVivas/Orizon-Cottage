// Backend/src/Routes/auth.routes.js
import express from 'express';
import { 
    register, 
    login, 
    getProfile, 
    changePasswordByAdmin 
} from '../Logic/auth.controller.js';
import { verifyToken, isDirectivoOrAdmin, isAdmin } from '../Middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas
router.post('/login', login);

// Rutas protegidas
router.post('/register', verifyToken, isDirectivoOrAdmin, register);  // Cambiado de isAdmin a isDirectivoOrAdmin
router.put('/change-password', verifyToken, isAdmin, changePasswordByAdmin);

// Ruta para obtener perfil (cualquier usuario autenticado)
router.get('/profile', verifyToken, getProfile);

export default router;
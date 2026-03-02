// Backend/src/Routes/student.routes.js
import express from 'express';
import {
    getStudents,
    getStudentById,
    getStudentByDocument,
    getStudentsByGrade
} from '../Logic/student.controller.js';
import { verifyToken } from '../Middleware/auth.middleware.js';  // Solo importamos verifyToken

const router = express.Router();

// Todas las rutas de estudiantes son públicas para pruebas
// (luego las protegemos cuando todo funcione)
router.get('/', getStudents);
router.get('/id/:id', getStudentById);
router.get('/document/:document', getStudentByDocument);
router.get('/grade/:grade', getStudentsByGrade);

// Versión con autenticación (comentada por ahora)
// router.get('/', verifyToken, getStudents);
// router.get('/id/:id', verifyToken, getStudentById);
// router.get('/document/:document', verifyToken, getStudentByDocument);
// router.get('/grade/:grade', verifyToken, getStudentsByGrade);

export default router;
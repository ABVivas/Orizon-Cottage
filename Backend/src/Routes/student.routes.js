// Backend/src/Routes/student.routes.js
import express from 'express';
import {
    getStudents,
    getStudentById,
    getStudentByDocument,
    getStudentsByGrade,
    getStudentsByTeacher,
    getStudentsByParent
} from '../Logic/student.controller.js';
import { verifyToken } from '../Middleware/auth.middleware.js';

const router = express.Router();

// Rutas existentes
router.get('/', getStudents);
router.get('/id/:id', getStudentById);
router.get('/document/:document', getStudentByDocument);
router.get('/grade/:grade', getStudentsByGrade);

// 🔥 NUEVAS RUTAS (protegidas con token)
router.get('/docente/:docenteId', verifyToken, getStudentsByTeacher);
router.get('/acudiente/:cedulaPadre', verifyToken, getStudentsByParent);

export default router;
// Backend/src/Routes/student.routes.js
import express from 'express';
import {
    getStudents,
    getStudentById,
    getStudentByDocument,
    getStudentsByGrade,
    getStudentsByTeacher,
    getStudentsByParent,
    updateStudent
} from '../Logic/student.controller.js';
import { verifyToken } from '../Middleware/auth.middleware.js';

const router = express.Router();

// Rutas existentes (algunas públicas, otras protegidas según tu necesidad)
router.get('/', getStudents);
router.get('/id/:id', getStudentById);
router.get('/document/:document', getStudentByDocument);
router.get('/grade/:grade', getStudentsByGrade);

// Rutas protegidas con token
router.get('/docente/:docenteId', verifyToken, getStudentsByTeacher);
router.get('/acudiente/:cedulaPadre', verifyToken, getStudentsByParent);

// NUEVA RUTA PARA ACTUALIZAR ESTUDIANTE (protegida)
router.put('/:id', verifyToken, updateStudent);

export default router;
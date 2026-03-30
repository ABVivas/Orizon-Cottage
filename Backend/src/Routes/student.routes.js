// Backend/src/Routes/student.routes.js
import express from 'express';
import {
    getStudents,
    getStudentById,
    getStudentByDocument,
    getStudentsByGrade,
    getStudentsByTeacher,
    getStudentsByParent,
    updateStudent,
    createStudent,      // NUEVA IMPORTACIÓN
    deleteStudent       // NUEVA IMPORTACIÓN (opcional)
} from '../Logic/student.controller.js';
import { verifyToken } from '../Middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas (si quieres protegerlas, añade verifyToken)
router.get('/', getStudents);
router.get('/id/:id', getStudentById);
router.get('/document/:document', getStudentByDocument);
router.get('/grade/:grade', getStudentsByGrade);

// NUEVA RUTA PARA CREAR ESTUDIANTE (protegida)
router.post('/', verifyToken, createStudent);

// NUEVA RUTA PARA ELIMINAR ESTUDIANTE (protegida)
router.delete('/:id', verifyToken, deleteStudent);

// Rutas protegidas con token
router.get('/docente/:docenteId', verifyToken, getStudentsByTeacher);
router.get('/acudiente/:cedulaPadre', verifyToken, getStudentsByParent);
router.put('/:id', verifyToken, updateStudent);

export default router;
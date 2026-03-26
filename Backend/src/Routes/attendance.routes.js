// Backend/src/Routes/attendance.routes.js
import express from 'express';
import {
    registerAttendance,
    getAttendanceByDate,
    getAttendanceSummary,
    getAttendanceByStudent,
    getAttendanceByTeacher
} from '../Logic/attendance.controller.js';
import { verifyToken } from '../Middleware/auth.middleware.js';

const router = express.Router();

// Rutas
router.post('/', verifyToken, registerAttendance);
router.get('/', verifyToken, getAttendanceByDate);
router.get('/summary', verifyToken, getAttendanceSummary);
router.get('/estudiante/:studentId', verifyToken, getAttendanceByStudent);
router.get('/docente/:docenteId', verifyToken, getAttendanceByTeacher);

export default router;
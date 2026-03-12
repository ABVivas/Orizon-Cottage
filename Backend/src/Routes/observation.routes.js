// Backend/src/Routes/observation.routes.js
import express from 'express';
import {
    createObservation,
    getObservationsByTeacher,
    getObservationsByStudent
} from '../Logic/observation.controller.js';
import { verifyToken } from '../Middleware/auth.middleware.js';

const router = express.Router();

// Rutas
router.post('/', verifyToken, createObservation);                 // Crear observación
router.get('/docente/:docenteId', verifyToken, getObservationsByTeacher);  // Por docente
router.get('/estudiante/:studentId', verifyToken, getObservationsByStudent); // Por estudiante

export default router;
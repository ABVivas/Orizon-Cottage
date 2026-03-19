// Backend/src/Routes/observation.routes.js
import express from 'express';
import upload from '../Middleware/upload.middleware.js';
import {
    createObservation,
    createObservationWithFile,
    getObservationsByTeacher,
    getObservationsByStudent,
    updateObservationFollowup,
    getObservationsSummary
} from '../Logic/observation.controller.js';
import { verifyToken } from '../Middleware/auth.middleware.js';

const router = express.Router();

// Rutas principales
router.post('/', verifyToken, createObservation);                    // Crear observación SIN archivo
router.post('/with-file', verifyToken, upload.single('documento'), createObservationWithFile); // Crear observación CON archivo

router.get('/docente/:docenteId', verifyToken, getObservationsByTeacher); // Por docente
router.get('/estudiante/:studentId', verifyToken, getObservationsByStudent); // Por estudiante
router.get('/summary', verifyToken, getObservationsSummary);         // Resumen estadístico

// Ruta para seguimiento
router.put('/:observationId/followup', verifyToken, updateObservationFollowup);

export default router;
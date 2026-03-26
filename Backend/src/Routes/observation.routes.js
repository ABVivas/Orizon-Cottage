// Backend/src/Routes/observation.routes.js
// Backend/src/Routes/observation.routes.js
import express from 'express';
import upload from '../Middleware/upload.middleware.js';
import {
    createObservation,
    createObservationWithFile,
    getObservations,
    getObservationsByTeacher,
    getObservationsByStudent,
    updateObservationFollowup,
    getObservationsSummary
} from '../Logic/observation.controller.js';
import { verifyToken } from '../Middleware/auth.middleware.js';

const router = express.Router();

// Ruta para obtener observaciones con filtros
router.get('/', verifyToken, getObservations);

// Rutas principales
router.post('/', verifyToken, createObservation);
router.post('/with-file', verifyToken, upload.single('documento'), createObservationWithFile);
router.get('/docente/:docenteId', verifyToken, getObservationsByTeacher);
router.get('/estudiante/:studentId', verifyToken, getObservationsByStudent);
router.get('/summary', verifyToken, getObservationsSummary);
router.put('/:observationId/followup', verifyToken, updateObservationFollowup);

export default router;
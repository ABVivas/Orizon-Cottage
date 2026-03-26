// Backend/src/Routes/observation.routes.js
import express from 'express';
import upload from '../Middleware/upload.middleware.js';
import Observation from '../Data/observation.model.js';
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

// ===========================================
// OBTENER TODAS LAS OBSERVACIONES (con filtros)
// ===========================================
router.get('/', verifyToken, async (req, res) => {
    try {
        const { startDate, endDate, tipo, grado, limit = 50, page = 1 } = req.query;
        
        let query = {};
        
        // Filtro por fecha
        if (startDate && endDate) {
            query.fecha = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        // Filtro por tipo
        if (tipo && tipo !== 'todos' && tipo !== 'general') {
            query.tipo = tipo;
        }
        
        // Obtener observaciones con población
        let observationsQuery = Observation.find(query)
            .populate('studentId', 'apellido1 apellido grado_especifico')
            .populate('docenteId', 'nombre')
            .sort({ fecha: -1 });
        
        let observations = await observationsQuery;
        
        // Filtrar por grado si es necesario
        if (grado && grado !== 'todos') {
            observations = observations.filter(obs => 
                obs.studentId?.grado_especifico === grado
            );
        }
        
        // Paginación
        const total = observations.length;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginated = observations.slice(skip, skip + parseInt(limit));
        
        console.log(`📊 Enviando ${paginated.length} observaciones (total: ${total})`);
        
        res.json({
            success: true,
            data: paginated,
            total: total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        });
        
    } catch (error) {
        console.error('❌ Error al obtener observaciones:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Rutas principales
router.post('/', verifyToken, createObservation);
router.post('/with-file', verifyToken, upload.single('documento'), createObservationWithFile);

router.get('/docente/:docenteId', verifyToken, getObservationsByTeacher);
router.get('/estudiante/:studentId', verifyToken, getObservationsByStudent);
router.get('/summary', verifyToken, getObservationsSummary);

// Ruta para seguimiento
router.put('/:observationId/followup', verifyToken, updateObservationFollowup);

export default router;
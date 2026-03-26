// Backend/src/Routes/seguimiento.routes.js
import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../Middleware/auth.middleware.js';
import Observation from '../Data/observation.model.js';
import Student from '../Data/student.model.js';
import Attendance from '../Data/attendance.model.js';

const router = express.Router();

// Obtener datos para seguimiento general con filtros
router.get('/', verifyToken, async (req, res) => {
    try {
        const { curso, nivel, tipo, fecha, search } = req.query;
        
        console.log('🔍 Seguimiento general - Filtros:', { curso, nivel, tipo, fecha, search });
        
        // 1. Obtener todas las observaciones
        let query = {};
        
        // Filtro por fecha
        if (fecha) {
            const fechaInicio = new Date(fecha);
            fechaInicio.setHours(0, 0, 0, 0);
            const fechaFin = new Date(fecha);
            fechaFin.setHours(23, 59, 59, 999);
            query.fecha = { $gte: fechaInicio, $lte: fechaFin };
        }
        
        // Filtro por nivel
        if (nivel && nivel !== 'todos') {
            query.nivel = nivel;
        }
        
        // Filtro por tipo
        if (tipo && tipo !== 'todos') {
            query.tipo = tipo;
        }
        
        let observations = await Observation.find(query)
            .populate('studentId', 'apellido1 apellido grado_especifico grado')
            .populate('docenteId', 'nombre')
            .sort({ fecha: -1 });
        
        console.log(`📝 Observaciones encontradas: ${observations.length}`);
        
        // 2. Obtener todos los estudiantes
        const students = await Student.find();
        const studentsMap = new Map(students.map(s => [s._id.toString(), s]));
        
        // 3. Obtener inasistencias de los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const attendances = await Attendance.find({
            fecha: { $gte: thirtyDaysAgo },
            estado: { $in: ['ausente', 'tarde'] }
        });
        
        // Contar inasistencias por estudiante
        const inasistenciasMap = new Map();
        attendances.forEach(a => {
            const studentId = a.studentId?.toString();
            if (studentId) {
                inasistenciasMap.set(studentId, (inasistenciasMap.get(studentId) || 0) + 1);
            }
        });
        
        // 4. Agrupar observaciones por estudiante
        const estudiantesMap = new Map();
        
        observations.forEach(obs => {
            const studentId = obs.studentId?._id?.toString() || obs.studentId?.toString();
            if (!studentId) return;
            
            const student = obs.studentId || studentsMap.get(studentId);
            
            // Obtener el grado correctamente
            let grado = 'N/A';
            if (student) {
                grado = student.grado_especifico || student.grado || 'N/A';
                const gradoMap = {
                    'preescolar': '0°', 'primero': '1°', 'segundo': '2°', 'tercero': '3°',
                    'cuarto': '4°', 'quinto': '5°', 'sexto': '6°', 'septimo': '7°',
                    'octavo': '8°', 'noveno': '9°', 'decimo': '10°', 'once': '11°'
                };
                if (gradoMap[grado.toLowerCase()]) {
                    grado = gradoMap[grado.toLowerCase()];
                }
            }
            
            // Filtrar por curso si se especifica
            if (curso && curso !== 'todos' && grado !== curso) {
                return;
            }
            
            // Filtrar por búsqueda (nombre del estudiante)
            if (search && search.trim()) {
                const nombreEstudiante = student?.apellido1 || student?.apellido || '';
                if (!nombreEstudiante.toLowerCase().includes(search.toLowerCase())) {
                    return;
                }
            }
            
            let nombreEstudiante = 'Estudiante';
            if (student) {
                nombreEstudiante = student.apellido1 || student.apellido || 'Estudiante';
            }
            
            // Formatear fecha
            let fechaFormateada = null;
            if (obs.fecha) {
                const fecha = new Date(obs.fecha);
                if (!isNaN(fecha.getTime())) {
                    fechaFormateada = fecha.toISOString();
                }
            }
            
            if (!estudiantesMap.has(studentId)) {
                estudiantesMap.set(studentId, {
                    _id: studentId,
                    estudiante: nombreEstudiante,
                    curso: grado,
                    observaciones: 0,
                    inasistencias: inasistenciasMap.get(studentId) || 0,
                    ultimaObs: fechaFormateada,
                    nivel: obs.nivel || 'No especificado',
                    tipo: obs.tipo || 'General',
                    descripcion: obs.descripcion,
                    planMejora: obs.planMejora,
                    docente: obs.docenteId?.nombre || 'Docente',
                    observationId: obs._id
                });
            }
            
            const estData = estudiantesMap.get(studentId);
            estData.observaciones += 1;
            
            // Actualizar última observación si es más reciente
            if (obs.fecha && (!estData.ultimaObs || new Date(obs.fecha) > new Date(estData.ultimaObs))) {
                const fecha = new Date(obs.fecha);
                if (!isNaN(fecha.getTime())) {
                    estData.ultimaObs = fecha.toISOString();
                }
                estData.nivel = obs.nivel || estData.nivel;
                estData.tipo = obs.tipo || estData.tipo;
                estData.descripcion = obs.descripcion;
                estData.planMejora = obs.planMejora;
                estData.docente = obs.docenteId?.nombre || 'Docente';
                estData.observationId = obs._id;
            }
        });
        
        // Convertir a array y ordenar por número de observaciones
        const result = Array.from(estudiantesMap.values())
            .sort((a, b) => b.observaciones - a.observaciones);
        
        console.log(`✅ Seguimiento generado: ${result.length} estudiantes con observaciones`);
        
        res.json({
            success: true,
            data: result,
            stats: {
                total: result.length,
                casosGraves: result.filter(r => r.nivel === 'Tipo II' || r.nivel === 'Tipo III').length,
                totalInasistencias: result.reduce((sum, r) => sum + (r.inasistencias || 0), 0)
            }
        });
        
    } catch (error) {
        console.error('❌ Error en seguimiento:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Obtener detalle de un estudiante específico
router.get('/estudiante/:id', verifyToken, async (req, res) => {
    try {
        const studentId = req.params.id;
        
        console.log(`🔍 Buscando detalle del estudiante: ${studentId}`);
        
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de estudiante inválido'
            });
        }
        
        const student = await Student.findById(studentId);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }
        
        const observations = await Observation.find({ studentId })
            .populate('docenteId', 'nombre')
            .sort({ fecha: -1 });
        
        const attendances = await Attendance.find({
            studentId: studentId,
            estado: { $in: ['ausente', 'tarde'] }
        });
        
        console.log(`✅ Encontradas ${observations.length} observaciones y ${attendances.length} inasistencias`);
        
        res.json({
            success: true,
            data: {
                student,
                observations,
                inasistencias: attendances.length
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
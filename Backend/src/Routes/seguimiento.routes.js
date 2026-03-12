// Backend/src/Routes/seguimiento.routes.js
import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../Middleware/auth.middleware.js';

const router = express.Router();

// Obtener datos para seguimiento general
router.get('/', verifyToken, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        
        // 1. Obtener todas las observaciones
        const observations = await db.collection('observations').find().toArray();
        
        // 2. Obtener todos los estudiantes
        const students = await db.collection('students').find().toArray();
        const studentsMap = new Map(students.map(s => [s._id.toString(), s]));
        
        // 3. Obtener inasistencias (últimos 30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const attendances = await db.collection('attendances').find({
            fecha: { $gte: thirtyDaysAgo },
            estado: 'ausente'
        }).toArray();
        
        // Contar inasistencias por estudiante
        const inasistenciasMap = new Map();
        attendances.forEach(a => {
            const studentId = a.studentId?.toString();
            if (studentId) {
                inasistenciasMap.set(studentId, (inasistenciasMap.get(studentId) || 0) + 1);
            }
        });

        // 4. Construir datos para la tabla
        const seguimientoData = observations.map(obs => {
            const studentId = obs.studentId?.toString();
            const student = studentsMap.get(studentId);
            
            return {
                _id: obs._id,
                estudiante: student?.apellido1 || student?.apellido || 'N/A',
                curso: student?.grado || 'N/A',
                observaciones: 1, // Por ahora, contaremos después
                inasistencias: inasistenciasMap.get(studentId) || 0,
                nivel: obs.nivel || obs.gravedad || 'No especificado',
                tipo: obs.tipo || 'General',
                fecha: obs.fecha,
                descripcion: obs.descripcion,
                estado: obs.estado || 'pendiente'
            };
        });

        // Agrupar por estudiante para contar observaciones
        const groupedByStudent = new Map();
        seguimientoData.forEach(item => {
            const key = item.estudiante + item.curso;
            if (groupedByStudent.has(key)) {
                const existing = groupedByStudent.get(key);
                existing.observaciones += 1;
                // Mantener la observación más reciente
                if (new Date(item.fecha) > new Date(existing.fecha)) {
                    existing.fecha = item.fecha;
                    existing.nivel = item.nivel;
                    existing.tipo = item.tipo;
                }
            } else {
                groupedByStudent.set(key, { ...item });
            }
        });

        const result = Array.from(groupedByStudent.values());

        // Calcular estadísticas
        const stats = {
            total: result.length,
            casosGraves: result.filter(r => r.nivel === 'Grave' || r.nivel === 'Tipo 3').length,
            totalInasistencias: result.reduce((sum, r) => sum + r.inasistencias, 0)
        };

        res.json({
            success: true,
            data: result,
            stats
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
        const db = mongoose.connection.db;
        const studentId = req.params.id;
        
        // Obtener datos del estudiante
        const student = await db.collection('students').findOne({ 
            _id: new mongoose.Types.ObjectId(studentId) 
        });
        
        // Obtener observaciones del estudiante
        const observations = await db.collection('observations').find({
            studentId: studentId
        }).toArray();
        
        // Obtener inasistencias del estudiante
        const attendances = await db.collection('attendances').find({
            studentId: studentId,
            estado: 'ausente'
        }).toArray();
        
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
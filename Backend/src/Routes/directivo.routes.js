// Backend/src/Routes/directivo.routes.js
import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../Middleware/auth.middleware.js';

const router = express.Router();

// ===========================================
// DASHBOARD - Estadísticas generales
// ===========================================
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const db = mongoose.connection.db;

        // 1. Total estudiantes
        const totalEstudiantes = await db.collection('students').countDocuments();

        // 2. Total docentes (de users con rol docente)
        const totalDocentes = await db.collection('users').countDocuments({ rol: 'docente' });

        // 3. Inasistencias de hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        const inasistenciasHoy = await db.collection('attendances').countDocuments({
            fecha: { $gte: hoy, $lt: manana },
            estado: { $in: ['ausente', 'tarde'] }
        });

        // 4. Observaciones pendientes (no resueltas)
        const observacionesPendientes = await db.collection('observations').countDocuments({
            $or: [
                { estado: { $ne: 'resuelto' } },
                { estado: { $exists: false } }
            ]
        });

        // 5. Mensajes nuevos (no leídos)
        const mensajesNuevos = await db.collection('messages').countDocuments({
            leido: false,
            destinatarioId: { $ne: req.user.id } // Excluir los del propio usuario
        });

        // 6. Observaciones por nivel
        const observacionesPorNivel = await db.collection('observations').aggregate([
            {
                $group: {
                    _id: '$nivel',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        // Calcular total para porcentajes
        const totalObservaciones = observacionesPorNivel.reduce((acc, curr) => acc + curr.count, 0);

        const nivelesMap = {
            'Leve': 'Tipo 1',
            'Medio': 'Tipo 2', 
            'Grave': 'Tipo 3'
        };

        const nivelesFormateados = observacionesPorNivel.map(item => ({
            nivel: nivelesMap[item._id] || item._id,
            cantidad: item.count,
            porcentaje: Math.round((item.count / totalObservaciones) * 100) || 0
        }));

        // 7. Estudiantes en seguimiento (con más observaciones)
        const estudiantesSeguimiento = await db.collection('observations').aggregate([
            {
                $group: {
                    _id: '$studentId',
                    observaciones: { $sum: 1 }
                }
            },
            { $sort: { observaciones: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'estudiante'
                }
            },
            { $unwind: '$estudiante' },
            {
                $lookup: {
                    from: 'attendances',
                    localField: '_id',
                    foreignField: 'studentId',
                    as: 'asistencias'
                }
            }
        ]).toArray();

        const estudiantesFormateados = estudiantesSeguimiento.map(item => ({
            nombre: item.estudiante.apellido1 || item.estudiante.apellido,
            curso: item.estudiante.grado_especifico,
            observaciones: item.observaciones,
            inasistencias: item.asistencias.filter(a => a.estado === 'ausente').length,
            ultimaObs: '2025-10-01' // Pendiente
        }));

        res.json({
            success: true,
            data: {
                stats: {
                    totalEstudiantes,
                    totalDocentes,
                    inasistenciasHoy,
                    observacionesPendientes,
                    mensajesNuevos
                },
                observacionesPorNivel: nivelesFormateados,
                estudiantesSeguimiento: estudiantesFormateados
            }
        });

    } catch (error) {
        console.error('Error en dashboard directivo:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===========================================
// SEGUIMIENTO GENERAL - Lista de estudiantes con observaciones
// ===========================================
router.get('/seguimiento', verifyToken, async (req, res) => {
    try {
        const { curso, nivel, tipo, fecha } = req.query;
        const db = mongoose.connection.db;

        // Construir filtros
        let matchStage = {};

        // Agregación para obtener estudiantes con observaciones
        const pipeline = [
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'estudiante'
                }
            },
            { $unwind: '$estudiante' },
            {
                $group: {
                    _id: '$studentId',
                    observaciones: { $sum: 1 },
                    ultimaObs: { $max: '$fecha' },
                    niveles: { $addToSet: '$nivel' },
                    estudiante: { $first: '$estudiante' }
                }
            }
        ];

        // Aplicar filtros si existen
        if (nivel && nivel !== 'todos') {
            pipeline.unshift({
                $match: { nivel: nivel }
            });
        }

        if (tipo && tipo !== 'todos') {
            pipeline.unshift({
                $match: { tipo: tipo }
            });
        }

        if (fecha) {
            const fechaBusqueda = new Date(fecha);
            fechaBusqueda.setHours(0, 0, 0, 0);
            const fechaFin = new Date(fecha);
            fechaFin.setHours(23, 59, 59, 999);
            
            pipeline.unshift({
                $match: {
                    fecha: { $gte: fechaBusqueda, $lte: fechaFin }
                }
            });
        }

        const estudiantes = await db.collection('observations').aggregate(pipeline).toArray();

        // Obtener inasistencias para cada estudiante
        const result = await Promise.all(estudiantes.map(async (est) => {
            const inasistencias = await db.collection('attendances').countDocuments({
                studentId: est._id,
                estado: 'ausente'
            });

            return {
                nombre: est.estudiante.apellido1 || est.estudiante.apellido,
                curso: est.estudiante.grado_especifico,
                observaciones: est.observaciones,
                inasistencias,
                nivel: est.niveles[0] || 'No especificado',
                ultimaObs: est.ultimaObs.toISOString().split('T')[0]
            };
        }));

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error en seguimiento:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===========================================
// REPORTES - Generar reportes
// ===========================================
router.post('/reportes/generar', verifyToken, async (req, res) => {
    try {
        const { tipo, periodo, fechaInicio, fechaFin, cursos } = req.body;
        const db = mongoose.connection.db;

        let startDate, endDate;

        if (periodo === 'diario') {
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
        } else if (periodo === 'semanal') {
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
        } else if (periodo === 'mensual') {
            endDate = new Date();
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (periodo === 'personalizado') {
            startDate = new Date(fechaInicio);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(fechaFin);
            endDate.setHours(23, 59, 59, 999);
        }

        let data = [];

        if (tipo === 'asistencia') {
            data = await db.collection('attendances').aggregate([
                {
                    $match: {
                        fecha: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            fecha: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } },
                            estado: '$estado'
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.fecha': 1 } }
            ]).toArray();
        } else if (tipo === 'observaciones') {
            data = await db.collection('observations').aggregate([
                {
                    $match: {
                        fecha: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            fecha: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } },
                            nivel: '$nivel',
                            tipo: '$tipo'
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.fecha': 1 } }
            ]).toArray();
        } else if (tipo === 'general') {
            const asistencia = await db.collection('attendances').countDocuments({
                fecha: { $gte: startDate, $lte: endDate }
            });
            const observaciones = await db.collection('observations').countDocuments({
                fecha: { $gte: startDate, $lte: endDate }
            });

            data = {
                totalAsistencia: asistencia,
                totalObservaciones: observaciones,
                periodo: { inicio: startDate, fin: endDate }
            };
        }

        // Guardar reporte generado
        const reporte = {
            nombre: `Reporte de ${tipo} - ${new Date().toLocaleDateString()}`,
            tipo,
            fechaGeneracion: new Date(),
            periodo: { inicio: startDate, fin: endDate },
            data
        };

        await db.collection('reports').insertOne(reporte);

        res.json({
            success: true,
            data: reporte
        });

    } catch (error) {
        console.error('Error generando reporte:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===========================================
// REPORTES - Obtener reportes recientes
// ===========================================
router.get('/reportes/recientes', verifyToken, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        
        const reportes = await db.collection('reports')
            .find()
            .sort({ fechaGeneracion: -1 })
            .limit(5)
            .toArray();

        res.json({
            success: true,
            data: reportes.map(r => ({
                nombre: r.nombre,
                fecha: r.fechaGeneracion.toLocaleString()
            }))
        });

    } catch (error) {
        console.error('Error obteniendo reportes:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
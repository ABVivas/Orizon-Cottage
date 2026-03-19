// Backend/src/Logic/observation.controller.js
import Observation from "../Data/observation.model.js";
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// ===========================================
// CREAR OBSERVACIÓN SIN ARCHIVO
// ===========================================
export const createObservation = async (req, res) => {
    try {
        const { studentId, docenteId, tipo, nivel, descripcion, planMejora } = req.body;

        console.log('📝 Creando observación:', { studentId, docenteId, tipo, nivel });

        // Validar campos requeridos
        if (!studentId || !docenteId || !tipo || !descripcion || !nivel) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos son obligatorios"
            });
        }

        // Validar que el nivel sea uno de los permitidos
        if (!["Tipo I", "Tipo II", "Tipo III"].includes(nivel)) {
            return res.status(400).json({
                success: false,
                message: "El nivel debe ser Tipo I, Tipo II o Tipo III según el Manual de Convivencia"
            });
        }

        // Determinar si requiere seguimiento (Tipo II y Tipo III siempre requieren)
        const requiereSeguimiento = nivel !== "Tipo I";

        const newObservation = new Observation({
            studentId,
            docenteId,
            tipo,
            nivel,
            descripcion,
            planMejora: planMejora || '',
            requiereSeguimiento,
            // Si es Tipo II o III, inicializar el seguimiento
            seguimiento: requiereSeguimiento ? [{
                comentario: "Observación creada - Pendiente de seguimiento",
                realizadoPor: docenteId,
                estado: "pendiente"
            }] : []
        });

        await newObservation.save();

        // Poblar los datos del docente para la respuesta
        await newObservation.populate('docenteId', 'nombre');

        res.status(201).json({
            success: true,
            message: "Observación registrada exitosamente",
            data: newObservation
        });

    } catch (error) {
        console.error('❌ Error al crear observación:', error);
        res.status(500).json({
            success: false,
            message: "Error al guardar la observación",
            error: error.message
        });
    }
};

// ===========================================
// CREAR OBSERVACIÓN CON ARCHIVO (NUEVO)
// ===========================================
export const createObservationWithFile = async (req, res) => {
    try {
        const { studentId, docenteId, tipo, nivel, descripcion, planMejora } = req.body;
        const file = req.file;

        console.log('📝 Creando observación CON ARCHIVO:', { studentId, docenteId, tipo, nivel, file: file?.originalname });

        // Validar campos requeridos
        if (!studentId || !docenteId || !tipo || !descripcion || !nivel) {
            // Si hay archivo, eliminarlo para no dejar archivos huérfanos
            if (file) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({
                success: false,
                message: "Todos los campos son obligatorios"
            });
        }

        // Validar que el nivel sea uno de los permitidos
        if (!["Tipo I", "Tipo II", "Tipo III"].includes(nivel)) {
            if (file) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({
                success: false,
                message: "El nivel debe ser Tipo I, Tipo II o Tipo III según el Manual de Convivencia"
            });
        }

        // Determinar si requiere seguimiento (Tipo II y Tipo III siempre requieren)
        const requiereSeguimiento = nivel !== "Tipo I";

        // Preparar objeto de observación
        const observationData = {
            studentId,
            docenteId,
            tipo,
            nivel,
            descripcion,
            planMejora: planMejora || '',
            requiereSeguimiento,
            seguimiento: requiereSeguimiento ? [{
                comentario: "Observación creada - Pendiente de seguimiento",
                realizadoPor: docenteId,
                estado: "pendiente"
            }] : []
        };

        // Si hay archivo, agregar información del documento
        if (file) {
            observationData.documentoPlan = {
                nombre: file.originalname,
                url: `/uploads/${file.filename}`,
                tipo: file.mimetype,
                fechaSubida: new Date()
            };
        }

        const newObservation = new Observation(observationData);
        await newObservation.save();

        // Poblar los datos del docente para la respuesta
        await newObservation.populate('docenteId', 'nombre');

        res.status(201).json({
            success: true,
            message: "Observación registrada exitosamente",
            data: newObservation
        });

    } catch (error) {
        console.error('❌ Error al crear observación con archivo:', error);
        
        // Si hay archivo, eliminarlo en caso de error
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error al eliminar archivo:', unlinkError);
            }
        }
        
        res.status(500).json({
            success: false,
            message: "Error al guardar la observación",
            error: error.message
        });
    }
};

// ===========================================
// OBTENER OBSERVACIONES POR DOCENTE
// ===========================================
export const getObservationsByTeacher = async (req, res) => {
    try {
        const { docenteId } = req.params;
        const { limit = 20, page = 1 } = req.query;

        console.log('🔍 Buscando observaciones para docente ID:', docenteId);

        // Validar que el ID sea válido
        if (!mongoose.Types.ObjectId.isValid(docenteId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de docente inválido'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const observaciones = await Observation.find({
            docenteId: new mongoose.Types.ObjectId(docenteId)
        })
        .populate('studentId', 'apellido1 apellido grado_especifico id_estudiante')
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        const total = await Observation.countDocuments({
            docenteId: new mongoose.Types.ObjectId(docenteId)
        });

        console.log(`✅ Encontradas ${observaciones.length} observaciones (total: ${total})`);

        res.json({
            success: true,
            data: observaciones,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('❌ Error en getObservationsByTeacher:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ===========================================
// OBTENER OBSERVACIONES POR ESTUDIANTE (para acudientes)
// ===========================================
export const getObservationsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { limit = 20, page = 1 } = req.query;

        console.log('🔍 Buscando observaciones para estudiante ID:', studentId);

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de estudiante inválido'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const observaciones = await Observation.find({
            studentId: studentId
        })
        .populate('docenteId', 'nombre')
        .populate('seguimiento.realizadoPor', 'nombre')
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        const total = await Observation.countDocuments({
            studentId: studentId
        });

        console.log(`✅ Encontradas ${observaciones.length} observaciones para el estudiante`);

        res.json({
            success: true,
            data: observaciones,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('❌ Error en getObservationsByStudent:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ===========================================
// ACTUALIZAR SEGUIMIENTO DE UNA OBSERVACIÓN
// ===========================================
export const updateObservationFollowup = async (req, res) => {
    try {
        const { observationId } = req.params;
        const { comentario, estado, realizadoPor } = req.body;

        if (!mongoose.Types.ObjectId.isValid(observationId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de observación inválido'
            });
        }

        const observation = await Observation.findById(observationId);

        if (!observation) {
            return res.status(404).json({
                success: false,
                message: 'Observación no encontrada'
            });
        }

        // Agregar nuevo seguimiento
        observation.seguimiento.push({
            comentario,
            estado,
            realizadoPor
        });

        // Si el estado es "cumplido", cerrar el seguimiento
        if (estado === "cumplido") {
            observation.requiereSeguimiento = false;
        }

        await observation.save();

        res.json({
            success: true,
            message: 'Seguimiento actualizado',
            data: observation
        });

    } catch (error) {
        console.error('❌ Error al actualizar seguimiento:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ===========================================
// OBTENER RESUMEN DE OBSERVACIONES POR NIVEL
// ===========================================
export const getObservationsSummary = async (req, res) => {
    try {
        const { startDate, endDate, grado } = req.query;

        let matchStage = {};

        // Filtro por fecha
        if (startDate && endDate) {
            matchStage.fecha = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Pipeline de agregación
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        nivel: "$nivel",
                        tipo: "$tipo"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.nivel": 1, "_id.tipo": 1 } }
        ];

        // Si se especifica grado, unir con estudiantes
        if (grado && grado !== 'todos') {
            pipeline.unshift({
                $lookup: {
                    from: "students",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "estudiante"
                }
            });
            pipeline.unshift({
                $match: {
                    "estudiante.grado_especifico": grado
                }
            });
        }

        const summary = await Observation.aggregate(pipeline);

        // Formatear resultados
        const result = {
            total: 0,
            porNivel: {
                "Tipo I": 0,
                "Tipo II": 0,
                "Tipo III": 0
            },
            porTipo: {
                "Académica": 0,
                "Disciplinaria": 0,
                "General": 0
            },
            detalle: summary
        };

        summary.forEach(item => {
            result.total += item.count;
            if (item._id.nivel) {
                result.porNivel[item._id.nivel] = (result.porNivel[item._id.nivel] || 0) + item.count;
            }
            if (item._id.tipo) {
                result.porTipo[item._id.tipo] = (result.porTipo[item._id.tipo] || 0) + item.count;
            }
        });

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('❌ Error al obtener resumen:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
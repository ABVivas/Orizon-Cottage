// Backend/src/Logic/observation.controller.js
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

        if (!studentId || !docenteId || !tipo || !descripcion || !nivel) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos son obligatorios"
            });
        }

        if (!["Tipo I", "Tipo II", "Tipo III"].includes(nivel)) {
            return res.status(400).json({
                success: false,
                message: "El nivel debe ser Tipo I, Tipo II o Tipo III según el Manual de Convivencia"
            });
        }

        const requiereSeguimiento = nivel !== "Tipo I";
        const fechaStr = new Date().toLocaleDateString('en-CA');

        const newObservation = new Observation({
            studentId,
            docenteId,
            tipo,
            nivel,
            descripcion,
            planMejora: planMejora || '',
            requiereSeguimiento,
            fecha: fechaStr,
            seguimiento: requiereSeguimiento ? [{
                comentario: "Observación creada - Pendiente de seguimiento",
                realizadoPor: docenteId,
                estado: "pendiente"
            }] : []
        });

        await newObservation.save();
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
// CREAR OBSERVACIÓN CON ARCHIVO
// ===========================================
export const createObservationWithFile = async (req, res) => {
    try {
        const { studentId, docenteId, tipo, nivel, descripcion, planMejora } = req.body;
        const file = req.file;

        console.log('📝 Creando observación CON ARCHIVO:', { studentId, docenteId, tipo, nivel, file: file?.originalname });

        if (!studentId || !docenteId || !tipo || !descripcion || !nivel) {
            if (file) fs.unlinkSync(file.path);
            return res.status(400).json({
                success: false,
                message: "Todos los campos son obligatorios"
            });
        }

        if (!["Tipo I", "Tipo II", "Tipo III"].includes(nivel)) {
            if (file) fs.unlinkSync(file.path);
            return res.status(400).json({
                success: false,
                message: "El nivel debe ser Tipo I, Tipo II o Tipo III según el Manual de Convivencia"
            });
        }

        const requiereSeguimiento = nivel !== "Tipo I";
        const fechaStr = new Date().toLocaleDateString('en-CA');

        const observationData = {
            studentId,
            docenteId,
            tipo,
            nivel,
            descripcion,
            planMejora: planMejora || '',
            requiereSeguimiento,
            fecha: fechaStr,
            seguimiento: requiereSeguimiento ? [{
                comentario: "Observación creada - Pendiente de seguimiento",
                realizadoPor: docenteId,
                estado: "pendiente"
            }] : []
        };

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
        await newObservation.populate('docenteId', 'nombre');

        res.status(201).json({
            success: true,
            message: "Observación registrada exitosamente",
            data: newObservation
        });

    } catch (error) {
        console.error('❌ Error al crear observación con archivo:', error);
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        res.status(500).json({
            success: false,
            message: "Error al guardar la observación",
            error: error.message
        });
    }
};

// ===========================================
// OBTENER OBSERVACIONES CON FILTROS (NUEVA FUNCIÓN)
// ===========================================
export const getObservations = async (req, res) => {
    try {
        const { startDate, endDate, tipo, nivel, studentId, limit = 100, page = 1 } = req.query;
        
        console.log('🔍 Buscando observaciones con filtros:', { startDate, endDate, tipo, nivel });
        
        let query = {};
        
        // Filtro por fechas - IMPORTANTE: las fechas son strings en formato YYYY-MM-DD
        if (startDate && endDate) {
            query.fecha = {
                $gte: startDate,
                $lte: endDate
            };
            console.log('📅 Filtro de fechas:', { startDate, endDate });
        }
        
        // Filtro por tipo
        if (tipo && tipo !== 'todos' && tipo !== 'undefined') {
            query.tipo = tipo;
        }
        
        // Filtro por nivel
        if (nivel && nivel !== 'todos' && nivel !== 'undefined') {
            query.nivel = nivel;
        }
        
        // Filtro por estudiante
        if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
            query.studentId = new mongoose.Types.ObjectId(studentId);
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const observations = await Observation.find(query)
            .populate('studentId', 'apellido1 apellido grado_especifico')
            .populate('docenteId', 'nombre')
            .sort({ fecha: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Observation.countDocuments(query);
        
        console.log(`✅ Encontradas ${observations.length} observaciones (total: ${total})`);
        
        res.json({
            success: true,
            data: observations,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        });
        
    } catch (error) {
        console.error('❌ Error en getObservations:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ===========================================
// OBTENER OBSERVACIONES POR DOCENTE
// ===========================================
export const getObservationsByTeacher = async (req, res) => {
    try {
        const { docenteId } = req.params;
        const { limit = 20, page = 1, startDate, endDate } = req.query;

        console.log('🔍 Buscando observaciones para docente ID:', docenteId);

        if (!mongoose.Types.ObjectId.isValid(docenteId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de docente inválido'
            });
        }

        let query = {
            docenteId: new mongoose.Types.ObjectId(docenteId)
        };
        
        if (startDate && endDate) {
            query.fecha = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const observaciones = await Observation.find(query)
            .populate('studentId', 'apellido1 apellido grado_especifico id_estudiante')
            .sort({ fecha: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Observation.countDocuments(query);

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
// OBTENER OBSERVACIONES POR ESTUDIANTE
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

        observation.seguimiento.push({
            comentario,
            estado,
            realizadoPor
        });

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
        
        console.log('📊 Generando resumen de observaciones...');
        console.log('📅 Fechas:', { startDate, endDate });
        
        let query = {};
        
        if (startDate && endDate) {
            query.fecha = {
                $gte: startDate,
                $lte: endDate
            };
        }
        
        let observations = await Observation.find(query).populate('studentId', 'grado_especifico');
        
        console.log(`📝 Total observaciones encontradas: ${observations.length}`);
        
        if (grado && grado !== 'todos') {
            observations = observations.filter(obs => 
                obs.studentId?.grado_especifico === grado
            );
            console.log(`📝 Filtradas por grado ${grado}: ${observations.length} observaciones`);
        }
        
        const porNivel = {
            "Tipo I": 0,
            "Tipo II": 0,
            "Tipo III": 0
        };
        
        const porTipo = {
            "Académica": 0,
            "Disciplinaria": 0,
            "General": 0
        };
        
        observations.forEach(obs => {
            if (obs.nivel && porNivel.hasOwnProperty(obs.nivel)) {
                porNivel[obs.nivel]++;
            }
            if (obs.tipo && porTipo.hasOwnProperty(obs.tipo)) {
                porTipo[obs.tipo]++;
            }
        });
        
        const total = observations.length;
        
        console.log('📊 Resumen generado:', { total, porNivel });
        
        res.json({
            success: true,
            data: {
                total,
                porNivel,
                porTipo
            }
        });

    } catch (error) {
        console.error('❌ Error al obtener resumen:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
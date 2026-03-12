// Backend/src/Logic/observation.controller.js
import Observation from "../Data/observation.model.js";
import mongoose from 'mongoose';

// ===========================================
// FUNCIÓN PARA CREAR OBSERVACIONES (FALTANTE)
// ===========================================
export const createObservation = async (req, res) => {
    try {
        const { studentId, docenteId, tipo, descripcion, nivel } = req.body;

        console.log('📝 Creando observación:', { studentId, docenteId, tipo, nivel });

        // Validar campos requeridos
        if (!studentId || !docenteId || !tipo || !descripcion || !nivel) {
            return res.status(400).json({ 
                success: false,
                message: "Todos los campos son obligatorios" 
            });
        }

        const newObservation = new Observation({
            studentId,
            docenteId,
            tipo,
            descripcion,
            nivel
        });

        await newObservation.save();

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
// TUS FUNCIONES EXISTENTES
// ===========================================

// Obtener observaciones por docente
export const getObservationsByTeacher = async (req, res) => {
    try {
        const { docenteId } = req.params;

        console.log('🔍 Buscando observaciones para docente ID:', docenteId);

        const observaciones = await Observation.find({
            docenteId: new mongoose.Types.ObjectId(docenteId)
        })
        .populate('studentId', 'apellido1 apellido grado_especifico')
        .sort({ fecha: -1 })
        .limit(20);

        console.log(`✅ Encontradas ${observaciones.length} observaciones`);

        res.json({
            success: true,
            data: observaciones
        });

    } catch (error) {
        console.error('❌ Error en getObservationsByTeacher:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Obtener observaciones por estudiante (para acudientes)
export const getObservationsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        console.log('🔍 Buscando observaciones para estudiante ID:', studentId);

        const observaciones = await Observation.find({
            studentId: studentId
        })
        .populate('docenteId', 'nombre')
        .sort({ fecha: -1 })
        .limit(20);

        console.log(`✅ Encontradas ${observaciones.length} observaciones`);

        res.json({
            success: true,
            data: observaciones
        });

    } catch (error) {
        console.error('❌ Error en getObservationsByStudent:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
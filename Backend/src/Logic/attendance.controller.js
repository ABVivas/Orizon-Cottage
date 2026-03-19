// Backend/src/Logic/attendance.controller.js

import Attendance from '../Data/attendance.model.js';

// ===========================================
// REGISTRAR ASISTENCIA
// ===========================================
export const registerAttendance = async (req, res) => {
    try {
        const { studentId, fecha, estado, motivo, observacion, registradoPor } = req.body;

        console.log('📝 Registrando asistencia:', { studentId, fecha, estado, motivo, observacion });

        // Validar campos requeridos
        if (!studentId || !fecha || !estado || !registradoPor) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        // Crear objeto de fecha
        const fechaObj = new Date(fecha);
        fechaObj.setHours(0, 0, 0, 0);

        // Verificar si ya existe registro para este estudiante en esta fecha
        let attendance = await Attendance.findOne({
            studentId,
            fecha: fechaObj
        });

        if (attendance) {
            // Actualizar existente
            attendance.estado = estado;
            attendance.motivo = motivo || '';
            attendance.observacion = observacion || '';
            attendance.registradoPor = registradoPor;
            await attendance.save();
            console.log('✅ Asistencia actualizada:', attendance._id);
        } else {
            // Crear nuevo
            attendance = new Attendance({
                studentId,
                fecha: fechaObj,
                estado,
                motivo: motivo || '',
                observacion: observacion || '',
                registradoPor
            });
            await attendance.save();
            console.log('✅ Asistencia creada:', attendance._id);
        }

        res.json({
            success: true,
            message: 'Asistencia registrada',
            attendance
        });

    } catch (error) {
        console.error('❌ Error al registrar asistencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar asistencia',
            error: error.message
        });
    }
};

// ===========================================
// OBTENER ASISTENCIA POR FECHA
// ===========================================
export const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Fecha requerida'
            });
        }

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const attendance = await Attendance.find({
            fecha: { $gte: startDate, $lte: endDate }
        }).populate('studentId', 'apellido1 apellido grado grado_especifico');

        console.log('📤 Enviando', attendance.length, 'registros de asistencia');

        res.json({
            success: true,
            attendance
        });

    } catch (error) {
        console.error('❌ Error al obtener asistencia:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ===========================================
// OBTENER ASISTENCIA POR ESTUDIANTE
// ===========================================
export const getAttendanceByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { limit } = req.query;

        console.log(`🔍 Buscando asistencias para estudiante: ${studentId}`);

        // Construir query
        let query = Attendance.find({ studentId }).sort({ fecha: -1 }); // más recientes primero

        // Aplicar límite si viene en la query
        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const asistencias = await query;

        console.log(`✅ Encontradas ${asistencias.length} asistencias`);

        res.json({
            success: true,
            data: asistencias
        });

    } catch (error) {
        console.error('❌ Error al obtener asistencias por estudiante:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ===========================================
// OBTENER RESUMEN DE ASISTENCIA
// ===========================================
export const getAttendanceSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Fechas de inicio y fin requeridas'
            });
        }

        const summary = await Attendance.aggregate([
            {
                $match: {
                    fecha: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: '$estado',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            summary
        });

    } catch (error) {
        console.error('❌ Error al obtener resumen:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
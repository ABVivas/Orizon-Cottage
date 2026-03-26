// Backend/src/Logic/attendance.controller.js
// Backend/src/Logic/attendance.controller.js
import Attendance from '../Data/attendance.model.js';
import mongoose from 'mongoose';
import Student from '../Data/student.model.js';

// ===========================================
// REGISTRAR ASISTENCIA
// ===========================================
export const registerAttendance = async (req, res) => {
    try {
        const { studentId, fecha, estado, motivo, observacion, registradoPor } = req.body;

        console.log('📝 Registrando asistencia:', { studentId, fecha, estado, motivo, observacion });

        if (!studentId || !fecha || !estado || !registradoPor) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        // La fecha ya viene en formato YYYY-MM-DD del frontend
        const fechaStr = fecha;

        let attendance = await Attendance.findOne({
            studentId,
            fecha: fechaStr
        });

        if (attendance) {
            attendance.estado = estado;
            attendance.motivo = motivo || '';
            attendance.observacion = observacion || '';
            attendance.registradoPor = registradoPor;
            await attendance.save();
            console.log('✅ Asistencia actualizada:', attendance._id);
        } else {
            attendance = new Attendance({
                studentId,
                fecha: fechaStr,
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

        const attendance = await Attendance.find({
            fecha: date
        }).populate('studentId', 'apellido1 apellido grado_especifico');

        console.log('📤 Enviando', attendance.length, 'registros de asistencia para fecha:', date);

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
// OBTENER ASISTENCIA POR RANGO DE FECHAS (PARA REPORTES)
// ===========================================
export const getAttendanceByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        console.log('📅 Reporte asistencia - Rango:', { startDate, endDate });
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Fechas de inicio y fin requeridas'
            });
        }

        const attendance = await Attendance.find({
            fecha: { $gte: startDate, $lte: endDate }
        }).populate('studentId', 'apellido1 apellido grado_especifico');

        console.log(`✅ Encontrados ${attendance.length} registros de asistencia en el rango`);
        
        res.json({
            success: true,
            attendance
        });
        
    } catch (error) {
        console.error('❌ Error en getAttendanceByDateRange:', error);
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

        let query = Attendance.find({ studentId }).sort({ fecha: -1 });
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
// OBTENER ASISTENCIAS POR DOCENTE
// ===========================================
export const getAttendanceByTeacher = async (req, res) => {
    try {
        const { docenteId } = req.params;
        const { limit = 50, startDate, endDate } = req.query;

        console.log(`🔍 Buscando asistencias para docente: ${docenteId}`);

        if (!mongoose.Types.ObjectId.isValid(docenteId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de docente inválido'
            });
        }

        const db = mongoose.connection.db;
        const docente = await db.collection('users').findOne({
            _id: new mongoose.Types.ObjectId(docenteId),
            rol: 'docente'
        });

        if (!docente) {
            return res.status(404).json({
                success: false,
                message: 'Docente no encontrado'
            });
        }

        const gradosDocente = docente.cursosAsignados || [];

        if (gradosDocente.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: 'El docente no tiene grados asignados'
            });
        }

        console.log('📚 Grados del docente:', gradosDocente);

        const estudiantesIds = await db.collection('students')
            .find({ grado_especifico: { $in: gradosDocente } })
            .project({ _id: 1 })
            .toArray();

        const estudiantesIdList = estudiantesIds.map(e => e._id);

        if (estudiantesIdList.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: 'No hay estudiantes en los grados asignados'
            });
        }

        let query = { studentId: { $in: estudiantesIdList } };
        
        if (startDate && endDate) {
            query.fecha = { $gte: startDate, $lte: endDate };
        }

        let attendanceQuery = Attendance.find(query)
            .populate('studentId', 'apellido1 apellido grado_especifico')
            .sort({ fecha: -1 });

        if (limit) {
            attendanceQuery = attendanceQuery.limit(parseInt(limit));
        }

        const asistencias = await attendanceQuery;
        console.log(`✅ Encontradas ${asistencias.length} asistencias para el docente`);

        res.json({
            success: true,
            data: asistencias
        });

    } catch (error) {
        console.error('❌ Error en getAttendanceByTeacher:', error);
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
                    fecha: { $gte: startDate, $lte: endDate }
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
// Backend/src/Logic/attendance.controller.js
import Attendance from '../Data/attendance.model.js';
import Student from '../Data/student.model.js';

// Registrar asistencia
export const registerAttendance = async (req, res) => {
    try {
        const { studentId, fecha, estado, registradoPor } = req.body;
        
        // Verificar si ya existe registro para este estudiante en esta fecha
        let attendance = await Attendance.findOne({
            studentId,
            fecha: new Date(fecha)
        });

        if (attendance) {
            // Actualizar existente
            attendance.estado = estado;
            attendance.registradoPor = registradoPor;
            await attendance.save();
        } else {
            // Crear nuevo
            attendance = new Attendance({
                studentId,
                fecha,
                estado,
                registradoPor
            });
            await attendance.save();
        }

        res.json({
            success: true,
            message: 'Asistencia registrada',
            attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener asistencia por fecha
export const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.query;
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const attendance = await Attendance.find({
            fecha: { $gte: startDate, $lte: endDate }
        }).populate('studentId', 'apellido grado id_estudiante');

        res.json({
            success: true,
            attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener resumen de asistencia
export const getAttendanceSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
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
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
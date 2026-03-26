// Backend/src/Data/attendance.model.js
// Backend/src/Data/attendance.model.js
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    fecha: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        enum: ['presente', 'ausente', 'tarde'],
        required: true
    },
    motivo: {
        type: String,
        enum: ['enfermedad', 'permiso', 'sin_justificar', 'otro', ''],
        default: ''
    },
    observacion: {
        type: String,
        default: ''
    },
    registradoPor: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Índice compuesto para evitar duplicados en la misma fecha
attendanceSchema.index({ studentId: 1, fecha: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
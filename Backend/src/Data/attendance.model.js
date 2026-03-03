// Backend/src/Data/attendance.model.js
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    estado: {
        type: String,
        enum: ['presente', 'ausente', 'tarde', 'excusa'],
        required: true
    },
    registradoPor: {
        type: String,
        required: true
    },
    observacion: {
        type: String
    }
}, {
    timestamps: true
});

// Índice compuesto para evitar duplicados en la misma fecha
attendanceSchema.index({ studentId: 1, fecha: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
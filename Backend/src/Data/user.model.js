// Backend/src/Data/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    numeroIdentificacion: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    tipoIdentificacion: {
        type: String,
        enum: ['CC', 'TI', 'RC', 'CE', 'NIT'],
        default: 'CC'
    },
    nombre: {
        type: String,
        required: true
    },
    // El email pasa a ser opcional
    email: {
        type: String,
        sparse: true,  // Permite múltiples nulls
        lowercase: true,
        trim: true,
        default: null
    },
    // NUEVO CAMPO: Teléfono
    telefono: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['docente', 'acudiente', 'directivo', 'admin'],
        required: true
    },
    // Para acudientes: relación con estudiantes
    estudiantesAsociados: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    // Para docentes: cursos que dicta
    cursosAsignados: [{
        type: String
    }],
    activo: {
        type: Boolean,
        default: true
    },
    ultimoAcceso: {
        type: Date
    },
    // Para control de cambios de contraseña
    passwordCambiada: {
        type: Boolean,
        default: false  // Indica si el usuario ha cambiado la contraseña inicial
    },
    passwordCambiadaPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fechaPasswordCambiada: {
        type: Date
    }
}, {
    timestamps: true
});

// Índices - NOTA: No incluir email como único
userSchema.index({ numeroIdentificacion: 1 }, { unique: true });
userSchema.index({ rol: 1 });

const User = mongoose.model('User', userSchema);
export default User;
// backend/src/Data/student.model.js
// backend/src/Data/student.model.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    No: {
        type: Number
    },
    grado: {
        type: String,
        required: true,
        enum: ['preescolar', 'primaria', 'secundaria']
    },
    grado_especifico: {
        type: String,
        default: ''
    },
    id_estudiante: {
        type: String,
        required: true,
        unique: true
    },
    tipo_documento_estudiante: {
        type: String,
        enum: ['RCR', 'TI', 'CC', 'RC'],
        default: 'RCR'
    },
    apellido1: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        default: ''
    },
    fecha_nacimiento: {
        type: String
    },
    vereda: {
        type: String,
        default: 'LA CABAÑA'
    },
    telefono: {
        type: String
    },
    cedula_padre: {
        type: String
    },
    nombre_acudiente: {
        type: String
    },
    parentesco: {
        type: String,
        enum: ['PADRE', 'MADRE', 'ABUELO', 'TIO', 'OTRO']
    },
    // Documentos (campos con "S1" = Sí)
    ficha_matricula: { type: String, default: '' },
    simpade: { type: String, default: '' },
    autorizacion_imagen: { type: String, default: '' },
    documento_identidad_estudiante: { type: String, default: '' },
    documento_identidad_padre: { type: String, default: '' },
    carnet_vacunas: { type: String, default: '' },
    certificado_salud: { type: String, default: '' },
    certificado_sisben: { type: String, default: '' },
    seguro_estudiantil: { type: String, default: '' }
}, {
    timestamps: true,
    collection: 'students'
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
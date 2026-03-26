// Backend/src/Data/observation.model.js
import mongoose from "mongoose";

const observationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    docenteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fecha: {
        type: String,
        default: function() {
            return new Date().toLocaleDateString('en-CA');
        }
    },
    descripcion: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        enum: ["Académica", "Disciplinaria", "General"],
        required: true
    },
    nivel: {
        type: String,
        enum: ["Tipo I", "Tipo II", "Tipo III"],
        required: true
    },
    planMejora: {
        type: String,
        default: ""
    },
    requiereSeguimiento: {
        type: Boolean,
        default: false
    },
    documentoPlan: {
        nombre: String,
        url: String,
        tipo: String,
        fechaSubida: { type: Date, default: Date.now }
    },
    seguimiento: [{
        fecha: { type: Date, default: Date.now },
        comentario: String,
        realizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        estado: {
            type: String,
            enum: ["pendiente", "en_proceso", "cumplido", "incumplido"],
            default: "pendiente"
        }
    }],
    evidencias: [{
        nombre: String,
        url: String,
        fechaSubida: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

observationSchema.index({ studentId: 1, fecha: -1 });
observationSchema.index({ docenteId: 1, fecha: -1 });
observationSchema.index({ nivel: 1 });

export default mongoose.model("Observation", observationSchema);
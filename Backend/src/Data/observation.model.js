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
    type: Date,
    default: Date.now
  },
  descripcion: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ["Académica", "Disciplinaria"],
    required: true
  },
  nivel: {
    type: String,
    enum: ["Leve", "Medio", "Grave"],
    required: true
  },
  requiereSeguimiento: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model("Observation", observationSchema);

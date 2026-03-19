// Backend/src/Data/corrective.model.js
import mongoose from "mongoose";

const correctiveSchema = new mongoose.Schema({
  observationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Observation",
    required: true,
    unique: true // Solo un correctivo por observación
  },
  acciones: {
    type: String,
    required: true
  },
  responsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // podría ser docente o directivo
    required: true
  },
  fechaInicio: {
    type: Date,
    default: Date.now
  },
  fechaFin: {
    type: Date
  },
  estado: {
    type: String,
    enum: ["En seguimiento", "Finalizado", "Incumplido"],
    default: "En seguimiento"
  },
  evidencias: [
    {
      tipo: String, // PDF, Imagen, Nota, etc.
      url: String,
      fechaRegistro: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

export default mongoose.model("Corrective", correctiveSchema);

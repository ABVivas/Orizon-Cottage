// Backend/src/Data/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  remitenteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  destinatarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  asunto: {
    type: String,
    required: true
  },
  contenido: {
    type: String,
    required: true
  },
  leido: {
    type: Boolean,
    default: false
  },
  fechaEnvio: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model("Message", messageSchema);

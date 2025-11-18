import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  grado: {
    type: String,
    required: true
  },
  acudienteId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model("Student", studentSchema);

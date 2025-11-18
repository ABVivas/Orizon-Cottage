import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ["Presente", "Ausente", "Tarde"],
    required: true
  },
  registradoPor: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model("Attendance", attendanceSchema);

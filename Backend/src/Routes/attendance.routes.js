import express from "express";
import {
  markAttendance,
  getAttendanceByStudent,
  getAttendanceByDate
} from "../Logic/attendance.controller.js";

const router = express.Router();

// Registrar asistencia
router.post("/", markAttendance);

// Consultar asistencia por estudiante
router.get("/student/:studentId", getAttendanceByStudent);

// Consultar asistencia por fecha
router.get("/fecha/:fecha", getAttendanceByDate);

export default router;

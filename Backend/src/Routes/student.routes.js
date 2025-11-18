import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from "../Logic/student.controller.js";

const router = express.Router();

// Crear estudiante
router.post("/", createStudent);

// Obtener todos los estudiantes
router.get("/", getAllStudents);

// Obtener estudiante por ID
router.get("/:studentId", getStudentById);

// Actualizar estudiante
router.put("/:studentId", updateStudent);

// Eliminar estudiante
router.delete("/:studentId", deleteStudent);

export default router;

import express from "express";
import {
  createObservation,
  getObservationsByStudent,
  getObservationsByLevel
} from "../Logic/observation.controller.js";

const router = express.Router();

// Registrar nueva observación
router.post("/", createObservation);

// Obtener observaciones por estudiante
router.get("/student/:studentId", getObservationsByStudent);

// Filtrar por nivel de gravedad
router.get("/nivel/:nivel", getObservationsByLevel);

export default router;

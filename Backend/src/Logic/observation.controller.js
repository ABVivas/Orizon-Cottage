import Observation from "../Data/observation.model.js";

// Crear una observación
export const createObservation = async (req, res) => {
  try {
    const { studentId, docenteId, tipo, descripcion, nivel } = req.body;

    if (!studentId || !docenteId || !tipo || !descripcion || !nivel) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const newObs = new Observation({
      studentId,
      docenteId,
      tipo,
      descripcion,
      nivel
    });

    await newObs.save();

    res.status(201).json({
      message: "Observación registrada exitosamente",
      data: newObs
    });

  } catch (error) {
    res.status(500).json({ error: "Error al guardar la observación" });
  }
};


// Observaciones por estudiante
export const getObservationsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const data = await Observation.find({ studentId });

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Error al obtener observaciones" });
  }
};


// Observaciones por gravedad
export const getObservationsByLevel = async (req, res) => {
  try {
    const { nivel } = req.params;

    const data = await Observation.find({ nivel });

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Error al filtrar observaciones" });
  }
};


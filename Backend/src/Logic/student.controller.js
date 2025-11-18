import Student from "../Data/student.model.js";

// Crear estudiante
export const createStudent = async (req, res) => {
  try {
    const { studentId, nombre, apellido, grado, acudienteId } = req.body;

    if (!studentId || !nombre || !apellido || !grado || !acudienteId) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const exists = await Student.findOne({ studentId });
    if (exists) {
      return res.status(400).json({ error: "El estudiante ya está registrado" });
    }

    const newStudent = new Student({
      studentId,
      nombre,
      apellido,
      grado,
      acudienteId
    });

    await newStudent.save();

    res.status(201).json({
      message: "Estudiante registrado exitosamente",
      data: newStudent
    });

  } catch (error) {
    res.status(500).json({ error: "Error al registrar estudiante" });
  }
};


// Obtener todos los estudiantes
export const getAllStudents = async (req, res) => {
  try {
    const data = await Student.find();
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener estudiantes" });
  }
};

// Obtener estudiante por ID
export const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const data = await Student.findOne({ studentId });

    if (!data) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    res.status(200).json(data);

  } catch {
    res.status(500).json({ error: "Error al consultar estudiante" });
  }
};

// Actualizar estudiante
export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const updated = await Student.findOneAndUpdate(
      { studentId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Estudiante no existe" });
    }

    res.status(200).json({
      message: "Estudiante actualizado",
      data: updated
    });

  } catch {
    res.status(500).json({ error: "Error al actualizar estudiante" });
  }
};

// Eliminar estudiante
export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const deleted = await Student.findOneAndDelete({ studentId });

    if (!deleted) {
      return res.status(404).json({ error: "Estudiante no existe" });
    }

    res.status(200).json({ message: "Estudiante eliminado" });

  } catch {
    res.status(500).json({ error: "Error al eliminar estudiante" });
  }
};

import Attendance from "../Data/attendance.model.js";

// Registrar asistencia
export const markAttendance = async (req, res) => {
  try {
    const { studentId, estado, registradoPor } = req.body;

    if (!studentId || !estado || !registradoPor) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const newRecord = new Attendance({
      studentId,
      estado,
      registradoPor,
      fecha: new Date()
    });

    await newRecord.save();

    res.status(201).json({
      message: "Asistencia registrada correctamente",
      data: newRecord
    });

  } catch (error) {
    res.status(500).json({ error: "Error al registrar asistencia" });
  }
};

// Consultar asistencia por estudiante
export const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const records = await Attendance.find({ studentId });

    res.status(200).json(records);

  } catch (error) {
    res.status(500).json({ error: "Error al obtener inasistencias" });
  }
};

// Consultar asistencia por fecha
export const getAttendanceByDate = async (req, res) => {
  try {
    const { fecha } = req.params;

    const records = await Attendance.find({
      fecha: {
        $gte: new Date(fecha),
        $lt: new Date(fecha + "T23:59:59")
      }
    });

    res.status(200).json(records);

  } catch (error) {
    res.status(500).json({ error: "Error al obtener registros" });
  }

  
};



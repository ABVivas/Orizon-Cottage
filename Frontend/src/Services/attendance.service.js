// Frontend/src/Services/attendance.service.js

const API_URL = "http://localhost:3000/api/attendance";

/**
 * Registrar asistencia
 */
export const createAttendance = async (attendanceData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(attendanceData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al registrar asistencia");
  }

  return response.json();
};

/**
 * Obtener asistencia por estudiante
 */
export const getAttendanceByStudent = async (studentId) => {
  const response = await fetch(`${API_URL}/student/${studentId}`);

  if (!response.ok) {
    throw new Error("Error al obtener asistencia del estudiante");
  }

  return response.json();
};

/**
 * Obtener asistencia por fecha
 */
export const getAttendanceByDate = async (fecha) => {
  const response = await fetch(`${API_URL}/date/${fecha}`);

  if (!response.ok) {
    throw new Error("Error al obtener asistencia por fecha");
  }

  return response.json();
};

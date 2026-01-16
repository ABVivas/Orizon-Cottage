// Frontend/src/Services/student.service.js

const API_URL = "http://localhost:3000/api/students";

/**
 * Crear estudiante
 */
export const createStudent = async (studentData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(studentData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al crear estudiante");
  }

  return response.json();
};

/**
 * Obtener todos los estudiantes
 */
export const getAllStudents = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener estudiantes");
  }

  return response.json();
};

/**
 * Obtener estudiante por ID
 */
export const getStudentById = async (studentId) => {
  const response = await fetch(`${API_URL}/${studentId}`);

  if (!response.ok) {
    throw new Error("Estudiante no encontrado");
  }

  return response.json();
};

/**
 * Actualizar estudiante
 */
export const updateStudent = async (studentId, updatedData) => {
  const response = await fetch(`${API_URL}/${studentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updatedData)
  });

  if (!response.ok) {
    throw new Error("Error al actualizar estudiante");
  }

  return response.json();
};

/**
 * Eliminar estudiante
 */
export const deleteStudent = async (studentId) => {
  const response = await fetch(`${API_URL}/${studentId}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Error al eliminar estudiante");
  }

  return response.json();
};

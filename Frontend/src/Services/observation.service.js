// Frontend/src/Services/observation.service.js

const API_URL = "http://localhost:3000/api/observations";

/**
 * Crear observación disciplinaria
 */
export const createObservation = async (observationData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(observationData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al registrar observación");
  }

  return response.json();
};

/**
 * Obtener observaciones por estudiante
 */
export const getObservationsByStudent = async (studentId) => {
  const response = await fetch(`${API_URL}/student/${studentId}`);

  if (!response.ok) {
    throw new Error("Error al obtener observaciones del estudiante");
  }

  return response.json();
};

/**
 * Obtener todas las observaciones
 */
export const getAllObservations = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener observaciones");
  }

  return response.json();
};

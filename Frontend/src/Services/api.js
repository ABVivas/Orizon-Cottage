// Frontend/src/Services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicio para estudiantes
export const studentService = {
  // Obtener todos los estudiantes
  getAll: async () => {
    try {
      const response = await api.get('/students');
      return response.data;
    } catch (error) {
      console.error('Error en studentService.getAll:', error);
      throw error;
    }
  },

  // Obtener estudiante por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/students/id/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en studentService.getById:', error);
      throw error;
    }
  },

  // Obtener estudiante por documento
  getByDocument: async (document) => {
    try {
      const response = await api.get(`/students/document/${document}`);
      return response.data;
    } catch (error) {
      console.error('Error en studentService.getByDocument:', error);
      throw error;
    }
  },

  // Obtener estudiantes por grado
  getByGrade: async (grade) => {
    try {
      const response = await api.get(`/students/grade/${grade}`);
      return response.data;
    } catch (error) {
      console.error('Error en studentService.getByGrade:', error);
      throw error;
    }
  }
};

// Servicio para probar conexión
export const testService = {
  test: async () => {
    try {
      const response = await api.get('/test');
      return response.data;
    } catch (error) {
      console.error('Error en testService.test:', error);
      throw error;
    }
  }
};

export default api;
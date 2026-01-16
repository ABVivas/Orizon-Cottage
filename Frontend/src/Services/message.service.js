// Frontend/src/Services/message.service.js

const API_URL = "http://localhost:3000/api/messages";

/**
 * Enviar mensaje
 */
export const sendMessage = async (messageData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(messageData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al enviar mensaje");
  }

  return response.json();
};

/**
 * Obtener mensajes recibidos
 */
export const getReceivedMessages = async (userId) => {
  const response = await fetch(`${API_URL}/received/${userId}`);

  if (!response.ok) {
    throw new Error("Error al obtener mensajes recibidos");
  }

  return response.json();
};

/**
 * Obtener mensajes enviados
 */
export const getSentMessages = async (userId) => {
  const response = await fetch(`${API_URL}/sent/${userId}`);

  if (!response.ok) {
    throw new Error("Error al obtener mensajes enviados");
  }

  return response.json();
};

/**
 * Marcar mensaje como leído
 */
export const markMessageAsRead = async (messageId) => {
  const response = await fetch(`${API_URL}/read/${messageId}`, {
    method: "PUT"
  });

  if (!response.ok) {
    throw new Error("Error al marcar mensaje como leído");
  }

  return response.json();
};

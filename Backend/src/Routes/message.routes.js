// Backend/src/Routes/message.routes.js
import express from "express";
import {
  createMessage,
  getReceivedMessages,
  getSentMessages,
  markAsRead
} from "../Logic/message.controller.js";

const router = express.Router();

// Crear mensaje
router.post("/", createMessage);

// Mensajes recibidos por un usuario
router.get("/received/:userId", getReceivedMessages);

// Mensajes enviados por un usuario
router.get("/sent/:userId", getSentMessages);

// Marcar mensaje como leído
router.put("/read/:messageId", markAsRead);

export default router;

// Backend/src/Routes/message.routes.js
import express from "express";
import {
  createMessage,
  getReceivedMessages,
  getSentMessages,
  markAsRead
} from "../Logic/message.controller.js";
import { verifyToken } from "../Middleware/auth.middleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.post("/", verifyToken, createMessage);
router.get("/received/:userId", verifyToken, getReceivedMessages);
router.get("/sent/:userId", verifyToken, getSentMessages);
router.put("/read/:messageId", verifyToken, markAsRead);

export default router;
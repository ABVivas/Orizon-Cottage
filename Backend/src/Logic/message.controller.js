// Backend/src/Logic/message.controller.js
import Message from "../Data/message.model.js";

// Crear un mensaje
export const createMessage = async (req, res) => {
  try {
    const { remitenteId, destinatarioId, asunto, contenido } = req.body;

    const newMessage = new Message({
      remitenteId,
      destinatarioId,
      asunto,
      contenido
    });

    await newMessage.save();
    res.status(201).json({ message: "Mensaje enviado", data: newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener mensajes recibidos
export const getReceivedMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      destinatarioId: userId
    }).populate("remitenteId", "nombre apellido");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener mensajes enviados
export const getSentMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      remitenteId: userId
    }).populate("destinatarioId", "nombre apellido");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Marcar como leído
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { leido: true },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Mensaje no encontrado" });
    }

    res.status(200).json({ message: "Mensaje marcado como leído", data: updatedMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

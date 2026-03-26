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
      contenido,
      fechaEnvio: new Date()
    });

    await newMessage.save();
    
    // Poblar los datos para la respuesta
    await newMessage.populate('remitenteId', 'nombre');
    await newMessage.populate('destinatarioId', 'nombre');

    res.status(201).json({ 
      success: true,
      message: "Mensaje enviado", 
      data: newMessage 
    });
  } catch (error) {
    console.error('❌ Error al crear mensaje:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Obtener mensajes recibidos
export const getReceivedMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      destinatarioId: userId
    })
    .populate("remitenteId", "nombre")
    .populate("destinatarioId", "nombre")
    .sort({ fechaEnvio: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('❌ Error al obtener mensajes recibidos:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Obtener mensajes enviados
export const getSentMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      remitenteId: userId
    })
    .populate("remitenteId", "nombre")
    .populate("destinatarioId", "nombre")
    .sort({ fechaEnvio: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('❌ Error al obtener mensajes enviados:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
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
      return res.status(404).json({ 
        success: false,
        message: "Mensaje no encontrado" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Mensaje marcado como leído", 
      data: updatedMessage 
    });
  } catch (error) {
    console.error('❌ Error al marcar como leído:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};
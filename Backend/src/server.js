// backend/src/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './Config/db.js';

// Importar rutas
import studentRoutes from './Routes/student.routes.js';
import attendanceRoutes from './Routes/attendance.routes.js';
import observationRoutes from './Routes/observation.routes.js';
import messageRoutes from './Routes/message.routes.js';

dotenv.config();

// Conectar a MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/observations', observationRoutes);
app.use('/api/messages', messageRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ 
        message: '✅ API Orizon Cottage funcionando correctamente',
        database: 'Conectado a MongoDB',
        collections: ['students', 'teachers']
    });
});

// Ruta para verificar estado de la base de datos
app.get('/api/db-status', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const stats = {
            status: 'connected',
            database: mongoose.connection.name,
            collections: collections.map(c => c.name),
            studentCount: await mongoose.connection.db.collection('students').countDocuments()
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📚 Documentación API: http://localhost:${PORT}/api/test`);
});
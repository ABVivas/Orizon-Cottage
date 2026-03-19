// Backend/src/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './Config/db.js';

// Importar TODAS las rutas
import studentRoutes from './Routes/student.routes.js';
import attendanceRoutes from './Routes/attendance.routes.js';
import observationRoutes from './Routes/observation.routes.js';
import messageRoutes from './Routes/message.routes.js';
import authRoutes from './Routes/auth.routes.js';
import userRoutes from './Routes/user.routes.js';
import teacherRoutes from './Routes/teacher.routes.js';
import seguimientoRoutes from './Routes/seguimiento.routes.js';
import directivoRoutes from './Routes/directivo.routes.js';

dotenv.config();

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conectar a MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ===========================================
// CONFIGURACIÓN CORS - VERSIÓN MUY PERMISIVA PARA PRUEBAS
// ===========================================
app.use(cors({
    origin: true, // Esto permite cualquier origen
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para manejar preflight
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================================
// SERVIDOR DE ARCHIVOS ESTÁTICOS
// ===========================================
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));
console.log('📁 Sirviendo archivos estáticos desde:', uploadsPath);

// Registrar TODAS las rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/observations', observationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/seguimiento', seguimientoRoutes);
app.use('/api/directivo', directivoRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ 
        message: '✅ API Orizon Cottage funcionando correctamente',
        database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
    });
});

// Manejador de errores
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`📂 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📂 Documentación API: http://localhost:${PORT}/api/test`);
    console.log(`📂 Archivos estáticos disponibles en: http://localhost:${PORT}/uploads/`);
    console.log(`📂 MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Conectado' : '❌ Desconectado'}`);
});
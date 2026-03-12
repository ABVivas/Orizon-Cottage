// Backend/src/Routes/teacher.routes.js
import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../Middleware/auth.middleware.js';

const router = express.Router();

// Obtener todos los docentes
router.get('/', verifyToken, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const teachers = await db.collection('teachers').find().toArray();
        
        console.log(`📚 Enviando ${teachers.length} docentes`);
        
        res.json({
            success: true,
            data: teachers
        });
    } catch (error) {
        console.error('❌ Error al obtener docentes:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Obtener un docente por ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const teacher = await db.collection('teachers').findOne({ 
            _id: new mongoose.Types.ObjectId(req.params.id) 
        });
        
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Docente no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: teacher
        });
    } catch (error) {
        console.error('❌ Error al obtener docente:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Obtener docentes por asignatura
router.get('/asignatura/:asignatura', verifyToken, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const teachers = await db.collection('teachers').find({ 
            asignatura: req.params.asignatura 
        }).toArray();
        
        res.json({
            success: true,
            data: teachers
        });
    } catch (error) {
        console.error('❌ Error al obtener docentes por asignatura:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
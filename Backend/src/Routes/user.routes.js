// Backend/src/Routes/user.routes.js
import express from 'express';
import User from '../Data/user.model.js';
import Student from '../Data/student.model.js';
import { verifyToken, isDirectivoOrAdmin, isDirectivo, isAdmin } from '../Middleware/auth.middleware.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const router = express.Router();

// ===========================================
// OBTENER TODOS LOS USUARIOS (admin o directivo)
// ===========================================
router.get('/', verifyToken, isDirectivoOrAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===========================================
// OBTENER ESTADÍSTICAS PARA ADMIN (solo admin)
// ===========================================
router.get('/stats', verifyToken, async (req, res) => {
    try {
        if (req.user.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para ver estadísticas'
            });
        }

        const users = await User.find();
        const students = await Student.find();
        
        const stats = {
            totalStudents: students.length,
            totalTeachers: users.filter(u => u.rol === 'docente').length,
            totalParents: users.filter(u => u.rol === 'acudiente').length,
            totalUsers: users.length,
            totalAdmins: users.filter(u => u.rol === 'admin').length,
            totalDirectivos: users.filter(u => u.rol === 'directivo').length,
            activeUsers: users.filter(u => u.activo).length,
            inactiveUsers: users.filter(u => !u.activo).length
        };
        
        console.log('📊 Estadísticas enviadas:', stats);
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===========================================
// OBTENER DESTINATARIOS PARA MENSAJERÍA (ACTUALIZADO PARA DOCENTES)
// ===========================================
router.get('/destinatarios', verifyToken, async (req, res) => {
    try {
        let rolFilter = [];
        
        // Dependiendo del rol del usuario, mostrar diferentes destinatarios
        if (req.user.rol === 'admin' || req.user.rol === 'directivo') {
            // Admin y directivo pueden enviar a docentes, directivos y acudientes
            rolFilter = ['docente', 'directivo', 'acudiente'];
        } else if (req.user.rol === 'docente') {
            // Docente puede enviar a acudientes, directivos y otros docentes
            rolFilter = ['acudiente', 'directivo', 'docente'];
        } else if (req.user.rol === 'acudiente') {
            // Acudiente solo puede enviar a docentes y directivos
            rolFilter = ['docente', 'directivo'];
        } else {
            rolFilter = ['docente', 'directivo'];
        }
        
        const users = await User.find({
            rol: { $in: rolFilter },
            activo: true,
            _id: { $ne: req.user.id } // Excluir al propio usuario
        }).select('nombre rol _id');
        
        console.log(`📨 Enviando ${users.length} destinatarios disponibles para ${req.user.rol}`);
        
        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('❌ Error al obtener destinatarios:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===========================================
// OBTENER DESTINATARIOS PARA DOCENTES (legado - se mantiene por compatibilidad)
// ===========================================
router.get('/destinatarios-docente', verifyToken, async (req, res) => {
    try {
        const users = await User.find({
            rol: { $in: ['acudiente', 'directivo'] },
            activo: true
        }).select('nombre rol _id');
        
        console.log(`📨 Enviando ${users.length} destinatarios para docente (legado)`);
        
        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('❌ Error al obtener destinatarios para docente:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===========================================
// OBTENER USUARIOS POR ROL (admin o directivo)
// ===========================================
router.get('/rol/:rol', verifyToken, isDirectivoOrAdmin, async (req, res) => {
    try {
        const { rol } = req.params;
        const users = await User.find({ rol }).select('-password');
        res.json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===========================================
// OBTENER PERFIL DEL USUARIO AUTENTICADO
// ===========================================
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('❌ Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===========================================
// ACTUALIZAR PERFIL DEL USUARIO
// ===========================================
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { nombre, email, telefono } = req.body;
        
        console.log('📝 Actualizando perfil:', { nombre, email, telefono });
        
        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (email !== undefined) updateData.email = email;
        if (telefono !== undefined) updateData.telefono = telefono;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password');
        
        console.log('✅ Perfil actualizado:', user._id);
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('❌ Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===========================================
// ACTUALIZAR USUARIO POR ID (admin o directivo)
// ===========================================
router.put('/:id', verifyToken, isDirectivoOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, telefono, activo, cursosAsignados, rol } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }
        
        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (email !== undefined) updateData.email = email;
        if (telefono !== undefined) updateData.telefono = telefono;
        if (activo !== undefined) updateData.activo = activo;
        if (cursosAsignados !== undefined) updateData.cursosAsignados = cursosAsignados;
        if (rol !== undefined && req.user.rol === 'admin') updateData.rol = rol;
        
        console.log('📝 Actualizando usuario ID:', id);
        console.log('📝 Datos a actualizar:', updateData);
        
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        console.log('✅ Usuario actualizado:', updatedUser._id);
        
        res.json({
            success: true,
            user: updatedUser
        });
        
    } catch (error) {
        console.error('❌ Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===========================================
// CAMBIAR ESTADO DE USUARIO (admin o directivo)
// ===========================================
router.put('/:id/toggle-status', verifyToken, isDirectivoOrAdmin, async (req, res) => {
    try {
        const { activo } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { activo },
            { new: true }
        ).select('-password');
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===========================================
// RESETEAR CONTRASEÑA (admin o directivo)
// ===========================================
router.post('/:id/reset-password', verifyToken, isDirectivoOrAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const tempPassword = `Temp${Math.random().toString(36).slice(-6)}*`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({
            success: true,
            tempPassword
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
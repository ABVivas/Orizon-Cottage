// Backend/src/Routes/user.routes.js
import express from 'express';
import User from '../Data/user.model.js';
import Student from '../Data/student.model.js';
import { verifyToken, isDirectivo } from '../Middleware/auth.middleware.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// ===========================================
// OBTENER TODOS LOS USUARIOS (solo admin/directivo)
// ===========================================
router.get('/', verifyToken, isDirectivo, async (req, res) => {
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
// OBTENER ESTADÍSTICAS PARA ADMIN
// ===========================================
router.get('/stats', verifyToken, async (req, res) => {
    try {
        // Solo admin puede ver estadísticas
        if (req.user.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para ver estadísticas'
            });
        }

        // Obtener todos los usuarios
        const users = await User.find();
        
        // Obtener todos los estudiantes
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
// OBTENER DESTINATARIOS PARA MENSAJERÍA (acudientes)
// ===========================================
router.get('/destinatarios', verifyToken, async (req, res) => {
    try {
        const users = await User.find({
            rol: { $in: ['docente', 'directivo'] },
            activo: true
        }).select('nombre rol _id');
        
        console.log(`📨 Enviando ${users.length} destinatarios disponibles`);
        
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
// OBTENER DESTINATARIOS PARA DOCENTES
// ===========================================
router.get('/destinatarios-docente', verifyToken, async (req, res) => {
    try {
        const users = await User.find({
            rol: { $in: ['acudiente', 'directivo'] },
            activo: true
        }).select('nombre rol _id');
        
        console.log(`📨 Enviando ${users.length} destinatarios para docente`);
        
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
// OBTENER USUARIOS POR ROL (solo admin/directivo)
// ===========================================
router.get('/rol/:rol', verifyToken, isDirectivo, async (req, res) => {
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
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { nombre, email, telefono },
            { new: true }
        ).select('-password');
        
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
// CAMBIAR ESTADO DE USUARIO
// ===========================================
router.put('/:id/toggle-status', verifyToken, isDirectivo, async (req, res) => {
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
// RESETEAR CONTRASEÑA
// ===========================================
router.post('/:id/reset-password', verifyToken, isDirectivo, async (req, res) => {
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
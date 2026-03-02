// Backend/src/Routes/user.routes.js
import express from 'express';
import User from '../Data/user.model.js';
import { verifyToken, isDirectivo } from '../Middleware/auth.middleware.js';

const router = express.Router();

// Obtener todos los usuarios (solo admin/directivo)
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

// Cambiar estado de usuario
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

// Resetear contraseña
router.post('/:id/reset-password', verifyToken, isDirectivo, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Generar nueva contraseña temporal
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
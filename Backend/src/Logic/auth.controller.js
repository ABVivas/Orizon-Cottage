// Backend/src/Logic/auth.controller.js
import User from '../Data/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Login con número de identificación
export const login = async (req, res) => {
    try {
        const { numeroIdentificacion, password } = req.body;

        // Validar que existan los campos
        if (!numeroIdentificacion || !password) {
            return res.status(400).json({
                success: false,
                message: 'Número de identificación y contraseña son requeridos'
            });
        }

        // Buscar usuario por número de identificación
        const user = await User.findOne({ numeroIdentificacion });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar si el usuario está activo
        if (!user.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo. Contacte al administrador.'
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Actualizar último acceso
        user.ultimoAcceso = new Date();
        await user.save();

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: user._id, 
                numeroIdentificacion: user.numeroIdentificacion,
                rol: user.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                numeroIdentificacion: user.numeroIdentificacion,
                rol: user.rol,
                passwordCambiada: user.passwordCambiada
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

// Registro de nuevo usuario (solo admin)
export const register = async (req, res) => {
    try {
        const { 
            numeroIdentificacion, 
            tipoIdentificacion,
            nombre, 
            password,
            rol, 
            estudiantesAsociados, 
            cursosAsignados 
        } = req.body;

        // Validar que el número de identificación no exista
        const existingUser = await User.findOne({ numeroIdentificacion });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El número de identificación ya está registrado'
            });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario
        const user = new User({
            numeroIdentificacion,
            tipoIdentificacion: tipoIdentificacion || 'CC',
            nombre,
            password: hashedPassword,
            rol: rol || 'acudiente',
            estudiantesAsociados: estudiantesAsociados || [],
            cursosAsignados: cursosAsignados || [],
            passwordCambiada: false
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: {
                id: user._id,
                nombre: user.nombre,
                numeroIdentificacion: user.numeroIdentificacion,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

// Cambiar contraseña (solo el admin puede)
export const changePasswordByAdmin = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        const adminId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Encriptar nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.passwordCambiada = true;
        user.passwordCambiadaPor = adminId;
        user.fechaPasswordCambiada = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña',
            error: error.message
        });
    }
};

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('estudiantesAsociados', 'apellido grado id_estudiante');
        
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
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil',
            error: error.message
        });
    }
};
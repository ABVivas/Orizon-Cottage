// Backend/src/seed-admin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './Data/user.model.js';

dotenv.config();

const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orizon_cottage');
        
        console.log('✅ Conectado a MongoDB');

        // Verificar si ya existe un admin
        const adminExists = await User.findOne({ email: 'admin@orizoncottage.edu.co' });
        
        if (adminExists) {
            console.log('⚠️ El usuario admin ya existe');
            process.exit(0);
        }

        // Crear admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin123*', salt);

        const admin = new User({
            nombre: 'Administrador',
            email: 'admin@orizoncottage.edu.co',
            password: hashedPassword,
            rol: 'admin',
            activo: true
        });

        await admin.save();

        console.log('✅ Usuario admin creado exitosamente');
        console.log('📧 Email: admin@orizoncottage.edu.co');
        console.log('🔑 Contraseña: Admin123*');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createAdminUser();
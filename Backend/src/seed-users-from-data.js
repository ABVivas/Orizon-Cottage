// Backend/src/seed-users-from-data.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './Data/user.model.js';
import Student from './Data/student.model.js';

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orizon_cottage');
        console.log('✅ Conectado a MongoDB');

        // 1. CREAR ADMIN
        const adminExists = await User.findOne({ numeroIdentificacion: 'ADMIN-001' });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin123*', salt);
            
            const admin = new User({
                numeroIdentificacion: 'ADMIN-001',
                tipoIdentificacion: 'NIT',
                nombre: 'Administrador del Sistema',
                password: hashedPassword,
                rol: 'admin',
                activo: true,
                passwordCambiada: false
            });
            await admin.save();
            console.log('✅ Admin creado - ID: ADMIN-001 / Pass: Admin123*');
        }

        // 2. CREAR ACUDIENTES DESDE STUDENTS
        console.log('\n👥 Procesando acudientes...');
        const students = await Student.find();
        console.log(`📊 Encontrados ${students.length} estudiantes`);

        // Mapa para agrupar acudientes por estudiante
        // IMPORTANTE: Cada estudiante tendrá su propio usuario acudiente
        let acudientesCreados = 0;

        for (const student of students) {
            if (student.id_estudiante && student.nombre_acudiente) {
                const numeroIdentificacion = student.id_estudiante; // El ID del estudiante será el usuario
                const password = student.id_estudiante; // La contraseña será el mismo ID
                
                // Verificar si ya existe un acudiente para este estudiante
                const existe = await User.findOne({ 
                    numeroIdentificacion: numeroIdentificacion,
                    rol: 'acudiente'
                });
                
                if (!existe) {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);

                    const nuevoAcudiente = new User({
                        numeroIdentificacion: numeroIdentificacion,
                        tipoIdentificacion: 'CC',
                        nombre: student.nombre_acudiente,
                        password: hashedPassword,
                        rol: 'acudiente',
                        estudiantesAsociados: [student._id],
                        activo: true,
                        passwordCambiada: false
                    });

                    await nuevoAcudiente.save();
                    console.log(`✅ Acudiente para estudiante ${student.id_estudiante}: ${student.nombre_acudiente}`);
                    console.log(`   📝 Usuario: ${numeroIdentificacion} / Contraseña: ${password}`);
                    acudientesCreados++;
                } else {
                    // Si ya existe, actualizar la lista de estudiantes asociados
                    if (!existe.estudiantesAsociados.includes(student._id)) {
                        existe.estudiantesAsociados.push(student._id);
                        await existe.save();
                        console.log(`   ↪ Estudiante ${student.id_estudiante} añadido a acudiente existente`);
                    }
                }
            }
        }

        // 3. CREAR DIRECTIVO
        const directivoExists = await User.findOne({ numeroIdentificacion: 'DIR-001' });
        if (!directivoExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Directivo123*', salt);
            
            const directivo = new User({
                numeroIdentificacion: 'DIR-001',
                tipoIdentificacion: 'CC',
                nombre: 'Coordinador Académico',
                password: hashedPassword,
                rol: 'directivo',
                activo: true,
                passwordCambiada: false
            });
            await directivo.save();
            console.log('✅ Directivo creado - ID: DIR-001 / Pass: Directivo123*');
        }

        // Mostrar resumen
        const totalUsers = await User.countDocuments();
        const admins = await User.countDocuments({ rol: 'admin' });
        const directivos = await User.countDocuments({ rol: 'directivo' });
        const docentes = await User.countDocuments({ rol: 'docente' });
        const acudientes = await User.countDocuments({ rol: 'acudiente' });

        console.log('\n📊 ===== RESUMEN FINAL =====');
        console.log(`👥 Total usuarios: ${totalUsers}`);
        console.log(`👑 Admin: ${admins}`);
        console.log(`👔 Directivos: ${directivos}`);
        console.log(`👨‍🏫 Docentes: ${docentes}`);
        console.log(`👪 Acudientes: ${acudientes}`);
        console.log('\n🔐 CREDENCIALES DE ACCESO:');
        console.log('Admin - Usuario: ADMIN-001 / Contraseña: Admin123*');
        console.log('Directivo - Usuario: DIR-001 / Contraseña: Directivo123*');
        console.log('Acudientes - Usuario: NÚMERO DE DOCUMENTO DEL ESTUDIANTE / Contraseña: EL MISMO NÚMERO');
        console.log('\n⚠️ IMPORTANTE: Los acudientes deben cambiar su contraseña en el primer ingreso');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedUsers();
// Backend/src/fix-teacher-users.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const fixTeacherUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orizon_cottage');
        console.log('✅ Conectado a MongoDB');

        // 1. ELIMINAR TODOS LOS USUARIOS DOCENTES ACTUALES
        const deleteResult = await mongoose.connection.db.collection('users').deleteMany({ 
            rol: 'docente' 
        });
        console.log(`🗑️ Eliminados ${deleteResult.deletedCount} usuarios docentes`);

        // 2. OBTENER TODOS LOS DOCENTES DE LA COLECCIÓN teachers
        const teachers = await mongoose.connection.db.collection('teachers').find().toArray();
        console.log(`📚 Encontrados ${teachers.length} docentes en la BD`);

        let creados = 0;

        for (const teacher of teachers) {
            // Crear nombre de usuario simplificado
            const nombreCompleto = teacher.docente;
            const partes = nombreCompleto.split(' ');
            
            let nombreUsuario = '';
            if (partes.length >= 2) {
                // Tomar primera palabra + última palabra
                nombreUsuario = (partes[0] + partes[partes.length - 1]).toLowerCase();
            } else {
                nombreUsuario = nombreCompleto.toLowerCase().replace(/\s+/g, '');
            }
            
            // Eliminar caracteres especiales (tildes, ñ, etc.)
            nombreUsuario = nombreUsuario
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]/g, '');
            
            // Añadir el id_docente para hacerlo único
            const codigo = teacher.id_docente || teacher.no || Math.floor(Math.random() * 1000);
            const usuarioFinal = nombreUsuario + codigo;
            
            // La contraseña es la MISMA que el usuario
            const password = usuarioFinal;
            
            // Generar hash de la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Extraer grados
            let gradosAsignados = [];
            if (teacher.grados) {
                gradosAsignados = teacher.grados.split(',').map(g => g.trim());
            }

            const nuevoDocente = {
                numeroIdentificacion: usuarioFinal,  // ← AHORA USA EL NOMBRE SIMPLIFICADO
                nombre: teacher.docente,
                password: hashedPassword,
                rol: 'docente',
                cursosAsignados: gradosAsignados,
                activo: true,
                passwordCambiada: false,
                metadata: {
                    id_original: teacher._id,
                    id_docente: teacher.id_docente,
                    codigo_original: `DOC-${codigo}`,
                    asignatura: teacher.asignatura,
                    grupo: teacher.direccion_grupo
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await mongoose.connection.db.collection('users').insertOne(nuevoDocente);
            console.log(`✅ Creado: ${teacher.docente}`);
            console.log(`   📝 Usuario: ${usuarioFinal}`);
            console.log(`   🔑 Contraseña: ${password}`);
            console.log('---');
            creados++;
        }

        console.log('\n📊 ===== RESUMEN =====');
        console.log(`✅ Usuarios docentes creados: ${creados}`);

        // Mostrar algunos ejemplos
        console.log('\n🔍 EJEMPLOS DE CREDENCIALES:');
        const ejemplos = await mongoose.connection.db.collection('users')
            .find({ rol: 'docente' })
            .limit(5)
            .toArray();
        
        ejemplos.forEach(doc => {
            console.log(`   ${doc.nombre}:`);
            console.log(`      Usuario: ${doc.numeroIdentificacion}`);
            console.log(`      Contraseña: ${doc.numeroIdentificacion}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

fixTeacherUsers();
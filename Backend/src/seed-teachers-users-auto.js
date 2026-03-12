// Backend/src/seed-teachers-users-auto.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedTeacherUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orizon_cottage');
        console.log('✅ Conectado a MongoDB');

        // Obtener todos los docentes de la colección teachers
        const teachersCollection = mongoose.connection.db.collection('teachers');
        const teachers = await teachersCollection.find().toArray();
        
        console.log(`📚 Encontrados ${teachers.length} docentes en la BD`);

        let creados = 0;
        let existentes = 0;

        for (const teacher of teachers) {
            // Verificar si ya existe un usuario para este docente
            const existe = await mongoose.connection.db.collection('users').findOne({ 
                nombre: teacher.docente,
                rol: 'docente'
            });

            if (!existe) {
                // Crear identificador único basado en el nombre
                const nombrePartes = teacher.docente.split(' ');
                let baseUsuario = '';
                
                if (nombrePartes.length >= 2) {
                    // Tomar primera parte del nombre + último apellido
                    baseUsuario = (nombrePartes[0] + nombrePartes[nombrePartes.length - 1]).toLowerCase();
                } else {
                    baseUsuario = teacher.docente.toLowerCase().replace(/\s+/g, '');
                }
                
                // Eliminar caracteres especiales
                baseUsuario = baseUsuario
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]/g, '');
                
                // Añadir el id_docente para hacerlo único
                const codigo = teacher.id_docente || teacher.no || Math.floor(Math.random() * 1000);
                const nombreUsuario = baseUsuario + codigo;
                
                // Contraseña igual al nombre de usuario (fácil de recordar)
                const passwordBase = nombreUsuario;
                
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(passwordBase, salt);

                // Extraer grados de la cadena si existe
                let gradosAsignados = [];
                if (teacher.grados) {
                    gradosAsignados = teacher.grados.split(',').map(g => g.trim());
                }

                const nuevoDocente = {
                    numeroIdentificacion: `DOC-${codigo}`,
                    nombre: teacher.docente,
                    password: hashedPassword,
                    rol: 'docente',
                    cursosAsignados: gradosAsignados,
                    activo: true,
                    passwordCambiada: false,
                    metadata: {
                        id_original: teacher._id,
                        id_docente: teacher.id_docente,
                        asignatura: teacher.asignatura,
                        grupo: teacher.direccion_grupo
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                await mongoose.connection.db.collection('users').insertOne(nuevoDocente);
                console.log(`✅ Creado: ${teacher.docente} -> Usuario: ${nombreUsuario}`);
                creados++;
            } else {
                console.log(`ℹ️ Ya existe: ${teacher.docente}`);
                existentes++;
            }
        }

        console.log('\n📊 ===== RESUMEN =====');
        console.log(`✅ Usuarios docentes creados: ${creados}`);
        console.log(`🔄 Docentes ya existentes: ${existentes}`);
        console.log(`📚 Total docentes: ${teachers.length}`);

        // Mostrar algunos ejemplos de los primeros usuarios creados
        if (creados > 0) {
            console.log('\n🔍 Ejemplos de credenciales:');
            const ejemplos = await mongoose.connection.db.collection('users')
                .find({ rol: 'docente' })
                .limit(3)
                .toArray();
            
            ejemplos.forEach(doc => {
                // Reconstruir el usuario (esto es solo para mostrar, la contraseña no se puede recuperar)
                const nombrePartes = doc.nombre.split(' ');
                let baseUsuario = '';
                if (nombrePartes.length >= 2) {
                    baseUsuario = (nombrePartes[0] + nombrePartes[nombrePartes.length - 1]).toLowerCase();
                } else {
                    baseUsuario = doc.nombre.toLowerCase().replace(/\s+/g, '');
                }
                baseUsuario = baseUsuario
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]/g, '');
                
                const codigo = doc.metadata?.id_docente || doc.numeroIdentificacion?.replace('DOC-', '') || 'XXX';
                console.log(`   ${doc.nombre}: Usuario: ${baseUsuario}${codigo}, Contraseña: ${baseUsuario}${codigo}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedTeacherUsers();
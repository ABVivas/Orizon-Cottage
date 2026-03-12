// Backend/src/seed-docentes-unificados.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedDocentesUnificados = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orizon_cottage');
        console.log('✅ Conectado a MongoDB');

        // 1. Obtener docentes de la colección teachers y agrupar
        console.log('📚 Procesando docentes desde teachers...');
        
        const teachers = await mongoose.connection.db.collection('teachers').aggregate([
            {
                $group: {
                    _id: "$docente",
                    registros: { $push: "$$ROOT" },
                    asignaturas: { $addToSet: "$asignatura" },
                    todosGrados: { $addToSet: "$grados" }
                }
            },
            {
                $project: {
                    nombre: "$_id",
                    asignaturas: 1,
                    totalAsignaturas: { $size: "$asignaturas" },
                    gradosConsolidados: {
                        $reduce: {
                            input: "$todosGrados",
                            initialValue: [],
                            in: { $setUnion: ["$$value", { $split: ["$$this", ", "] }] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    grados: {
                        $map: {
                            input: "$gradosConsolidados",
                            as: "grado",
                            in: {
                                $trim: {
                                    input: {
                                        $replaceAll: {
                                            input: "$$grado",
                                            find: "°",
                                            replacement: "°"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { nombre: 1 } }
        ]).toArray();

        console.log(`📚 Encontrados ${teachers.length} docentes únicos`);
        
        // Mostrar lista de docentes encontrados
        teachers.forEach((t, i) => {
            console.log(`   ${i+1}. ${t.nombre} - ${t.asignaturas.length} asignaturas - ${t.grados.length} grados`);
        });

        // 2. Eliminar usuarios docentes existentes (opcional - comentar si no quieres eliminar)
        const deleteResult = await mongoose.connection.db.collection('users').deleteMany({ 
            rol: 'docente' 
        });
        console.log(`🗑️ Eliminados ${deleteResult.deletedCount} usuarios docentes existentes`);

        // 3. Crear usuarios para cada docente único
        let creados = 0;
        let duplicados = 0;

        for (const teacher of teachers) {
            // Verificar si ya existe un usuario con este nombre
            const existe = await mongoose.connection.db.collection('users').findOne({
                nombre: teacher.nombre,
                rol: 'docente'
            });

            if (existe) {
                console.log(`⚠️ Ya existe usuario para: ${teacher.nombre}`);
                duplicados++;
                continue;
            }

            // Crear nombre de usuario simplificado
            const nombrePartes = teacher.nombre.split(' ');
            let baseUsuario = '';
            
            if (nombrePartes.length >= 2) {
                // Tomar primera palabra + última palabra
                baseUsuario = (nombrePartes[0] + nombrePartes[nombrePartes.length - 1]).toLowerCase();
            } else {
                baseUsuario = teacher.nombre.toLowerCase().replace(/\s+/g, '');
            }
            
            // Eliminar caracteres especiales (tildes, ñ, etc.)
            baseUsuario = baseUsuario
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]/g, '');
            
            // Usar el índice como identificador único
            const codigo = creados + 1;
            const usuarioFinal = baseUsuario + codigo;
            const password = usuarioFinal; // Contraseña = usuario
            
            // Generar hash de la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Extraer grados numéricos (eliminar el símbolo °)
            const gradosNumericos = teacher.grados
                .map(g => g.replace('°', '').trim())
                .filter(g => !isNaN(parseInt(g)))
                .map(g => parseInt(g) + '°'); // Volver a agregar °

            const nuevoDocente = {
                numeroIdentificacion: usuarioFinal,
                nombre: teacher.nombre,
                password: hashedPassword,
                rol: 'docente',
                cursosAsignados: gradosNumericos,
                asignaturas: teacher.asignaturas,
                activo: true,
                passwordCambiada: false,
                metadata: {
                    totalAsignaturas: teacher.totalAsignaturas,
                    gradosOriginales: teacher.grados,
                    codigo_original: `DOC-${codigo}`
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await mongoose.connection.db.collection('users').insertOne(nuevoDocente);
            console.log(`✅ Creado: ${teacher.nombre}`);
            console.log(`   📝 Usuario: ${usuarioFinal}`);
            console.log(`   🔑 Contraseña: ${password}`);
            console.log(`   📚 Asignaturas: ${teacher.asignaturas.join(', ')}`);
            console.log(`   📖 Grados: ${gradosNumericos.join(', ')}`);
            console.log('---');
            creados++;
        }

        console.log('\n📊 ===== RESUMEN FINAL =====');
        console.log(`📚 Total docentes únicos: ${teachers.length}`);
        console.log(`✅ Usuarios creados: ${creados}`);
        console.log(`⚠️ Usuarios ya existentes: ${duplicados}`);
        
        // Mostrar ejemplos de acceso
        if (creados > 0) {
            console.log('\n🔐 EJEMPLOS DE ACCESO:');
            const ejemplos = await mongoose.connection.db.collection('users')
                .find({ rol: 'docente' })
                .limit(3)
                .toArray();
            
            ejemplos.forEach(doc => {
                console.log(`   ${doc.nombre}:`);
                console.log(`      Usuario: ${doc.numeroIdentificacion}`);
                console.log(`      Contraseña: ${doc.numeroIdentificacion}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedDocentesUnificados();
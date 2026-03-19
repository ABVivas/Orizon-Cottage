// Backend/src/associate-acudientes-estudiantes.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const associateAcudientesEstudiantes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orizon_cottage');
        console.log('✅ Conectado a MongoDB');

        const db = mongoose.connection.db;

        // 1. Obtener todos los estudiantes
        const estudiantes = await db.collection('students').find({}).toArray();
        console.log(`📚 Total estudiantes: ${estudiantes.length}`);

        // 2. Crear un mapa de acudientes usando el ID del estudiante como clave
        let actualizados = 0;

        for (const est of estudiantes) {
            const idEstudiante = est.id_estudiante?.toString().trim();
            const nombreAcudiente = est.nombre_acudiente?.trim();
            const cedulaPadre = est.cedula_padre?.toString().trim();
            
            if (!idEstudiante || !nombreAcudiente || !cedulaPadre) continue;

            // Buscar el acudiente en users (usando el ID del estudiante como numeroIdentificacion)
            const acudiente = await db.collection('users').findOne({
                numeroIdentificacion: idEstudiante,
                rol: 'acudiente'
            });

            if (acudiente) {
                // Verificar si ya tiene este estudiante asociado
                const yaTiene = acudiente.estudiantesAsociados?.some(
                    id => id.toString() === est._id.toString()
                );

                if (!yaTiene) {
                    await db.collection('users').updateOne(
                        { _id: acudiente._id },
                        { 
                            $addToSet: { 
                                estudiantesAsociados: est._id 
                            }
                        }
                    );
                    console.log(`✅ Acudiente ${acudiente.nombre} actualizado con estudiante ${est.apellido1}`);
                    actualizados++;
                }
            } else {
                console.log(`⚠️ No existe acudiente con usuario ${idEstudiante} (estudiante: ${est.apellido1})`);
            }
        }

        console.log('\n📊 ===== RESUMEN =====');
        console.log(`📚 Total estudiantes: ${estudiantes.length}`);
        console.log(`✅ Acudientes actualizados: ${actualizados}`);

        // 3. Mostrar ejemplos
        console.log('\n🔍 EJEMPLOS DE ASOCIACIONES:');
        const ejemplos = await db.collection('users')
            .find({ 
                rol: 'acudiente',
                estudiantesAsociados: { $exists: true, $ne: [] }
            })
            .limit(3)
            .toArray();

        for (const ac of ejemplos) {
            console.log(`\n👤 Acudiente: ${ac.nombre} (Usuario: ${ac.numeroIdentificacion})`);
            console.log(`   📚 Estudiantes asociados: ${ac.estudiantesAsociados?.length || 0}`);
            
            if (ac.estudiantesAsociados?.length > 0) {
                const primerosEstudiantes = await db.collection('students')
                    .find({ _id: { $in: ac.estudiantesAsociados.slice(0, 2) } })
                    .toArray();
                
                primerosEstudiantes.forEach(est => {
                    console.log(`      - ${est.apellido1 || est.apellido} (${est.grado_especifico})`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

associateAcudientesEstudiantes();
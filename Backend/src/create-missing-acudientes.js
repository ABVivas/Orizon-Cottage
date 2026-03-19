// Backend/src/create-missing-acudientes.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createMissingAcudientes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orizon_cottage');
        console.log('✅ Conectado a MongoDB');

        const db = mongoose.connection.db;

        // 1. Obtener todos los estudiantes con cedula_padre
        const estudiantes = await db.collection('students').find({
            cedula_padre: { $exists: true, $ne: null, $ne: '' }
        }).toArray();

        console.log(`📚 Total estudiantes con cédula: ${estudiantes.length}`);

        // 2. Crear mapa de acudientes únicos
        const acudientesMap = new Map();

        for (const est of estudiantes) {
            const cedula = est.cedula_padre?.toString().trim();
            const nombre = est.nombre_acudiente?.trim();
            
            if (!cedula || !nombre) continue;

            if (!acudientesMap.has(cedula)) {
                // Verificar si ya existe en users
                const existe = await db.collection('users').findOne({
                    numeroIdentificacion: cedula
                });

                if (!existe) {
                    acudientesMap.set(cedula, {
                        numeroIdentificacion: cedula,
                        nombre: nombre,
                        estudiantes: []
                    });
                }
            }
            
            if (acudientesMap.has(cedula)) {
                acudientesMap.get(cedula).estudiantes.push(est._id);
            }
        }

        console.log(`📝 Acudientes a crear: ${acudientesMap.size}`);

        // 3. Crear los acudientes faltantes
        let creados = 0;
        for (const [cedula, data] of acudientesMap) {
            // Generar contraseña: últimos 4 dígitos + *
            const password = cedula.slice(-4) + '*';
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const nuevoAcudiente = {
                numeroIdentificacion: cedula,
                nombre: data.nombre,
                password: hashedPassword,
                rol: 'acudiente',
                activo: true,
                estudiantesAsociados: data.estudiantes,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await db.collection('users').insertOne(nuevoAcudiente);
            console.log(`✅ Acudiente creado: ${data.nombre} - Usuario: ${cedula} - Pass: ${password}`);
            creados++;
        }

        console.log('\n📊 RESUMEN:');
        console.log(`✅ Acudientes creados: ${creados}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createMissingAcudientes();
// Backend/src/migrate-attendance.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './Data/attendance.model.js';
import User from './Data/user.model.js';

dotenv.config();

const migrateAttendance = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orizon_cottage');
        console.log('✅ Conectado a MongoDB');
        
        // 1. Primero, eliminar el índice antiguo que causa problemas
        try {
            await Attendance.collection.dropIndex('studentId_1_fecha_1');
            console.log('🗑️ Índice antiguo eliminado');
        } catch (err) {
            console.log('⚠️ Índice antiguo no existía o ya fue eliminado');
        }
        
        // 2. Obtener todos los registros de asistencia sin docenteId
        const attendances = await Attendance.find({ docenteId: { $exists: false } });
        console.log(`📊 Encontrados ${attendances.length} registros para migrar`);
        
        let actualizados = 0;
        let errores = 0;
        
        for (const attendance of attendances) {
            let docenteId = null;
            
            // Intentar buscar el docente por registradoPor (si es un ID válido)
            if (attendance.registradoPor && attendance.registradoPor.length === 24) {
                try {
                    const user = await User.findById(attendance.registradoPor);
                    if (user && user.rol === 'docente') {
                        docenteId = user._id;
                    } else if (user && user.rol === 'admin') {
                        // Si es admin, buscar un docente de respaldo
                        const anyDocente = await User.findOne({ rol: 'docente' });
                        docenteId = anyDocente?._id;
                    }
                } catch (err) {
                    console.log(`⚠️ Error buscando usuario: ${attendance.registradoPor}`);
                }
            }
            
            // Si no se encontró, asignar el primer docente disponible
            if (!docenteId) {
                const defaultDocente = await User.findOne({ rol: 'docente' });
                if (defaultDocente) {
                    docenteId = defaultDocente._id;
                    console.log(`📌 Usando docente por defecto: ${defaultDocente.nombre}`);
                } else {
                    console.log(`❌ No se pudo asignar docente para registro ${attendance._id}`);
                    errores++;
                    continue;
                }
            }
            
            // Actualizar el registro con docenteId
            attendance.docenteId = docenteId;
            await attendance.save();
            actualizados++;
            
            if (actualizados % 10 === 0) {
                console.log(`✅ Progreso: ${actualizados}/${attendances.length}`);
            }
        }
        
        console.log('\n📊 ===== RESUMEN DE MIGRACIÓN =====');
        console.log(`✅ Registros migrados: ${actualizados}`);
        console.log(`❌ Registros con error: ${errores}`);
        console.log(`📊 Total procesados: ${attendances.length}`);
        
        // 3. Crear el nuevo índice
        await Attendance.collection.createIndex(
            { studentId: 1, docenteId: 1, fecha: 1 }, 
            { unique: true }
        );
        console.log('✅ Nuevo índice creado correctamente');
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Desconectado de MongoDB');
        process.exit(0);
    }
};

migrateAttendance();
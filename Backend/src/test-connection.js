// backend/src/test-connection.js
// Backend/src/Test-connection.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    try {
        console.log('🔄 Intentando conectar a MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/orizon_cottage');
        console.log('✅ Conexión exitosa a MongoDB');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('📚 Colecciones encontradas:');
        
        if (collections.length === 0) {
            console.log('   No hay colecciones creadas');
        } else {
            collections.forEach(col => console.log(`   - ${col.name}`));
        }
        
        // Contar estudiantes
        const studentCount = await db.collection('students').countDocuments();
        console.log(`👥 Total de estudiantes: ${studentCount}`);
        
        // Mostrar un ejemplo de estudiante si existe
        if (studentCount > 0) {
            const sampleStudent = await db.collection('students').findOne();
            console.log('\n📝 Ejemplo de estudiante:');
            console.log(sampleStudent);
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Desconectado de MongoDB');
        process.exit(0);
    }
};

testConnection();
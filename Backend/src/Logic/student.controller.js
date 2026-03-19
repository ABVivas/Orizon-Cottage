// Backend/src/Logic/student.controller.js
import Student from '../Data/student.model.js';
import mongoose from 'mongoose';

// ===========================================
// FUNCIONES EXISTENTES (DEBEN ESTAR PRIMERO)
// ===========================================

// Obtener todos los estudiantes
export const getStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener un estudiante por ID
export const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }
        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Buscar estudiante por número de documento (ID)
export const getStudentByDocument = async (req, res) => {
    try {
        const { document } = req.params;
        
        const student = await Student.findOne({ id_estudiante: document });
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado con ese documento'
            });
        }
        
        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener estudiantes por grado
export const getStudentsByGrade = async (req, res) => {
    try {
        const { grade } = req.params;
        const students = await Student.find({ grado: grade });
        
        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al filtrar por grado',
            error: error.message
        });
    }
};

// ===========================================
// FUNCIONES NUEVAS PARA DASHBOARDS
// ===========================================

// Obtener estudiantes por docente (basado en los grados que enseña)
export const getStudentsByTeacher = async (req, res) => {
    try {
        const { docenteId } = req.params;
        const db = mongoose.connection.db;

        console.log('🔍 Buscando estudiantes para docente ID:', docenteId);

        // 1. Buscar información del docente en users
        let docente;
        
        // Verificar si docenteId es un ObjectId válido
        if (mongoose.Types.ObjectId.isValid(docenteId)) {
            docente = await db.collection('users').findOne({ 
                _id: new mongoose.Types.ObjectId(docenteId),
                rol: 'docente'
            });
        } else {
            // Buscar por número de identificación
            docente = await db.collection('users').findOne({ 
                numeroIdentificacion: docenteId,
                rol: 'docente'
            });
        }

        if (!docente) {
            return res.status(404).json({
                success: false,
                message: 'Docente no encontrado'
            });
        }

        console.log('✅ Docente encontrado:', docente.nombre);
        console.log('📊 Datos completos del docente:', docente);

        // 2. Obtener los grados que enseña este docente
        let gradosDocente = [];

        // Opción 1: Desde cursosAsignados (recomendado)
        if (docente.cursosAsignados && docente.cursosAsignados.length > 0) {
            gradosDocente = docente.cursosAsignados;
            console.log('📚 Grados desde cursosAsignados:', gradosDocente);
        }

        // Opción 2: De la colección teachers (por nombre) - respaldo
        if (gradosDocente.length === 0) {
            const teacherInfo = await db.collection('teachers').findOne({
                docente: docente.nombre
            });

            if (teacherInfo?.grados) {
                // Procesar grados que pueden venir como "6°, 7°, 8°, 9°" o "6,7,8,9"
                const gradosString = teacherInfo.grados;
                if (typeof gradosString === 'string') {
                    gradosDocente = gradosString
                        .split(',')
                        .map(g => g.trim())
                        .map(g => g.includes('°') ? g : g + '°');
                } else if (Array.isArray(teacherInfo.grados)) {
                    gradosDocente = teacherInfo.grados.map(g => 
                        g.toString().includes('°') ? g.toString() : g.toString() + '°'
                    );
                }
                console.log('📚 Grados desde teachers:', gradosDocente);
            }
        }

        // Opción 3: Desde metadata
        if (gradosDocente.length === 0 && docente.metadata?.grados) {
            gradosDocente = docente.metadata.grados;
            console.log('📚 Grados desde metadata:', gradosDocente);
        }

        if (gradosDocente.length === 0) {
            console.log('⚠️ El docente no tiene grados asignados');
            return res.json({
                success: true,
                count: 0,
                data: [],
                grados: [],
                message: 'El docente no tiene grados asignados'
            });
        }

        // 3. Buscar estudiantes en esos grados
        console.log('🔎 Buscando estudiantes en grados:', gradosDocente);
        
        const estudiantes = await Student.find({
            grado_especifico: { $in: gradosDocente }
        });

        console.log(`✅ Encontrados ${estudiantes.length} estudiantes para el docente`);

        // 4. Calcular estadísticas básicas (opcional)
        const stats = {
            total: estudiantes.length,
            porGrado: {}
        };

        estudiantes.forEach(est => {
            const grado = est.grado_especifico;
            stats.porGrado[grado] = (stats.porGrado[grado] || 0) + 1;
        });

        res.json({
            success: true,
            count: estudiantes.length,
            data: estudiantes,
            grados: gradosDocente,
            stats: stats
        });

    } catch (error) {
        console.error('❌ Error en getStudentsByTeacher:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ===========================================
// FUNCIÓN ACTUALIZADA PARA ACUDIENTES
// ===========================================

// Obtener estudiantes por acudiente (por cédula) - VERSIÓN MEJORADA
export const getStudentsByParent = async (req, res) => {
    try {
        const { cedulaPadre } = req.params;
        const db = mongoose.connection.db;

        console.log('🔍 Buscando estudiantes para acudiente con cédula:', cedulaPadre);

        // 1. Buscar el acudiente en users
        const acudiente = await db.collection('users').findOne({
            numeroIdentificacion: cedulaPadre,
            rol: 'acudiente'
        });

        if (!acudiente) {
            console.log('⚠️ Acudiente no encontrado en users, buscando directamente en students...');
            
            // Fallback: buscar directamente por cedula_padre en students
            const estudiantesDirectos = await Student.find({
                cedula_padre: cedulaPadre
            });

            if (estudiantesDirectos.length > 0) {
                console.log(`✅ Encontrados ${estudiantesDirectos.length} estudiantes por búsqueda directa`);
                return res.json({
                    success: true,
                    count: estudiantesDirectos.length,
                    data: estudiantesDirectos,
                    source: 'direct'
                });
            }

            return res.json({
                success: true,
                count: 0,
                data: [],
                message: 'Acudiente no encontrado'
            });
        }

        console.log('✅ Acudiente encontrado:', acudiente.nombre);
        console.log('📚 Estudiantes asociados en users:', acudiente.estudiantesAsociados?.length || 0);

        // 2. Obtener los IDs de los estudiantes asociados
        const estudiantesIds = acudiente.estudiantesAsociados || [];

        if (estudiantesIds.length === 0) {
            console.log('⚠️ El acudiente no tiene estudiantes asociados en users');
            
            // Fallback: buscar directamente por cedula_padre
            const estudiantesDirectos = await Student.find({
                cedula_padre: cedulaPadre
            });

            if (estudiantesDirectos.length > 0) {
                console.log(`✅ Encontrados ${estudiantesDirectos.length} estudiantes por búsqueda directa`);
                
                // Actualizar el acudiente con estos estudiantes
                await db.collection('users').updateOne(
                    { _id: acudiente._id },
                    { 
                        $set: { 
                            estudiantesAsociados: estudiantesDirectos.map(e => e._id)
                        }
                    }
                );
                console.log('🔄 Acudiente actualizado con estudiantes');

                return res.json({
                    success: true,
                    count: estudiantesDirectos.length,
                    data: estudiantesDirectos,
                    source: 'direct-updated'
                });
            }

            return res.json({
                success: true,
                count: 0,
                data: [],
                message: 'El acudiente no tiene estudiantes asociados'
            });
        }

        // 3. Buscar la información completa de los estudiantes
        const estudiantes = await Student.find({
            _id: { $in: estudiantesIds }
        });

        console.log(`✅ Encontrados ${estudiantes.length} estudiantes para el acudiente`);

        res.json({
            success: true,
            count: estudiantes.length,
            data: estudiantes,
            source: 'users'
        });

    } catch (error) {
        console.error('❌ Error en getStudentsByParent:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
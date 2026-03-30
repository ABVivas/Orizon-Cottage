// Backend/src/Logic/student.controller.js
import Student from '../Data/student.model.js';
import mongoose from 'mongoose';

// ===========================================
// CREAR NUEVO ESTUDIANTE (NUEVA FUNCIÓN)
// ===========================================
export const createStudent = async (req, res) => {
    try {
        const {
            id_estudiante,
            apellido1,
            grado,
            grado_especifico,
            nombre_acudiente,
            cedula_padre,
            telefono,
            vereda,
            parentesco,
            tipo_documento_estudiante,
            fecha_nacimiento
        } = req.body;

        console.log('📝 Creando nuevo estudiante:', { id_estudiante, apellido1, grado_especifico });

        // Validar campos obligatorios
        if (!id_estudiante || !apellido1) {
            return res.status(400).json({
                success: false,
                message: 'ID del estudiante y nombre son obligatorios'
            });
        }

        // Verificar si ya existe un estudiante con ese ID
        const existingStudent = await Student.findOne({ id_estudiante });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un estudiante con este ID'
            });
        }

        // Determinar grado general si no viene
        let gradoGeneral = grado;
        if (!gradoGeneral && grado_especifico) {
            if (grado_especifico === '0°') {
                gradoGeneral = 'preescolar';
            } else if (['1°', '2°', '3°', '4°', '5°'].includes(grado_especifico)) {
                gradoGeneral = 'primaria';
            } else if (['6°', '7°', '8°', '9°', '10°', '11°'].includes(grado_especifico)) {
                gradoGeneral = 'secundaria';
            } else {
                gradoGeneral = 'primaria';
            }
        }

        // Crear el estudiante
        const newStudent = new Student({
            id_estudiante: id_estudiante,
            apellido1: apellido1,
            grado: gradoGeneral || 'primaria',
            grado_especifico: grado_especifico || '1°',
            nombre_acudiente: nombre_acudiente || '',
            cedula_padre: cedula_padre || '',
            telefono: telefono || '',
            vereda: vereda || 'LA CABAÑA',
            parentesco: parentesco || 'PADRE',
            tipo_documento_estudiante: tipo_documento_estudiante || 'RC',
            fecha_nacimiento: fecha_nacimiento || ''
        });

        await newStudent.save();

        console.log('✅ Estudiante creado:', newStudent._id);

        res.status(201).json({
            success: true,
            message: 'Estudiante creado exitosamente',
            data: newStudent
        });

    } catch (error) {
        console.error('❌ Error al crear estudiante:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

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

// Obtener estudiantes por docente
export const getStudentsByTeacher = async (req, res) => {
    try {
        const { docenteId } = req.params;
        const db = mongoose.connection.db;

        console.log('🔍 Buscando estudiantes para docente ID:', docenteId);

        let docente;
        if (mongoose.Types.ObjectId.isValid(docenteId)) {
            docente = await db.collection('users').findOne({
                _id: new mongoose.Types.ObjectId(docenteId),
                rol: 'docente'
            });
        } else {
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

        let gradosDocente = [];
        if (docente.cursosAsignados && docente.cursosAsignados.length > 0) {
            gradosDocente = docente.cursosAsignados;
        }

        if (gradosDocente.length === 0) {
            const teacherInfo = await db.collection('teachers').findOne({
                docente: docente.nombre
            });
            if (teacherInfo?.grados) {
                const gradosString = teacherInfo.grados;
                if (typeof gradosString === 'string') {
                    gradosDocente = gradosString
                        .split(',')
                        .map(g => g.trim())
                        .map(g => g.includes('°') ? g : g + '°');
                }
            }
        }

        if (gradosDocente.length === 0) {
            return res.json({
                success: true,
                count: 0,
                data: [],
                grados: [],
                message: 'El docente no tiene grados asignados'
            });
        }

        const estudiantes = await Student.find({
            grado_especifico: { $in: gradosDocente }
        });

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

// Obtener estudiantes por acudiente
export const getStudentsByParent = async (req, res) => {
    try {
        const { cedulaPadre } = req.params;
        const db = mongoose.connection.db;

        console.log('🔍 Buscando estudiantes para acudiente con cédula:', cedulaPadre);

        const acudiente = await db.collection('users').findOne({
            numeroIdentificacion: cedulaPadre,
            rol: 'acudiente'
        });

        if (!acudiente) {
            const estudiantesDirectos = await Student.find({
                cedula_padre: cedulaPadre
            });
            if (estudiantesDirectos.length > 0) {
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

        const estudiantesIds = acudiente.estudiantesAsociados || [];

        if (estudiantesIds.length === 0) {
            const estudiantesDirectos = await Student.find({
                cedula_padre: cedulaPadre
            });
            if (estudiantesDirectos.length > 0) {
                await db.collection('users').updateOne(
                    { _id: acudiente._id },
                    {
                        $set: {
                            estudiantesAsociados: estudiantesDirectos.map(e => e._id)
                        }
                    }
                );
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

        const estudiantes = await Student.find({
            _id: { $in: estudiantesIds }
        });

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

// Actualizar estudiante
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('📝 Actualizando estudiante ID:', id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de estudiante inválido'
            });
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        console.log('✅ Estudiante actualizado:', updatedStudent._id);

        res.json({
            success: true,
            message: 'Estudiante actualizado exitosamente',
            data: updatedStudent
        });

    } catch (error) {
        console.error('❌ Error al actualizar estudiante:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Eliminar estudiante
export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de estudiante inválido'
            });
        }

        const deletedStudent = await Student.findByIdAndDelete(id);

        if (!deletedStudent) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Estudiante eliminado exitosamente'
        });

    } catch (error) {
        console.error('❌ Error al eliminar estudiante:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// backend/src/Logic/student.controller.js
import Student from '../Data/student.model.js';

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
            message: 'Error al obtener estudiantes',
            error: error.message
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
            message: 'Error al buscar estudiante',
            error: error.message
        });
    }
};

// Buscar estudiante por número de documento
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
            message: 'Error en la búsqueda',
            error: error.message
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

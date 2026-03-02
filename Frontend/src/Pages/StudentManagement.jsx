// Frontend/src/Pages/StudentManagement.jsx
import { useState, useEffect } from 'react';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('todos');
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        filterStudents();
    }, [searchTerm, selectedGrade, students]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/students', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStudents(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterStudents = () => {
        let filtered = [...students];
        
        if (selectedGrade !== 'todos') {
            filtered = filtered.filter(s => s.grado === selectedGrade);
        }
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(s => 
                s.apellido?.toLowerCase().includes(term) ||
                s.id_estudiante?.includes(term) ||
                s.nombre_acudiente?.toLowerCase().includes(term)
            );
        }
        
        setFilteredStudents(filtered);
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setShowModal(true);
    };

    const handleDelete = async (studentId) => {
        if (!confirm('¿Está seguro de eliminar este estudiante?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/students/${studentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                fetchStudents();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <div style={styles.header}>
                <h2 style={styles.title}>Gestión de Estudiantes</h2>
                <button 
                    style={styles.addButton}
                    onClick={() => {
                        setSelectedStudent(null);
                        setShowModal(true);
                    }}
                >
                    + Nuevo Estudiante
                </button>
            </div>

            <div style={styles.filters}>
                <input
                    type="text"
                    placeholder="Buscar por nombre, ID o acudiente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
                
                <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    style={styles.gradeSelect}
                >
                    <option value="todos">Todos los grados</option>
                    <option value="preescolar">Preescolar</option>
                    <option value="primaria">Primaria</option>
                    <option value="secundaria">Secundaria</option>
                </select>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Nombre Completo</th>
                                <th style={styles.th}>Grado</th>
                                <th style={styles.th}>Acudiente</th>
                                <th style={styles.th}>Teléfono</th>
                                <th style={styles.th}>Vereda</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student._id} style={styles.tr}>
                                    <td style={styles.td}>{student.id_estudiante}</td>
                                    <td style={styles.td}>{student.apellido}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.gradeBadge,
                                            backgroundColor: student.grado === 'preescolar' ? '#27ae60' :
                                                           student.grado === 'primaria' ? '#2980b9' : '#8e44ad'
                                        }}>
                                            {student.grado}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{student.nombre_acudiente}</td>
                                    <td style={styles.td}>{student.telefono}</td>
                                    <td style={styles.td}>{student.vereda}</td>
                                    <td style={styles.td}>
                                        <button 
                                            style={styles.editButton}
                                            onClick={() => handleEdit(student)}
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            style={styles.deleteButton}
                                            onClick={() => handleDelete(student._id)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    title: {
        margin: 0,
        color: '#2c3e50',
        fontSize: '22px'
    },
    addButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    filters: {
        display: 'flex',
        gap: '15px',
        marginBottom: '25px'
    },
    searchInput: {
        flex: 2,
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px'
    },
    gradeSelect: {
        flex: 1,
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    tableHeader: {
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #27ae60'
    },
    th: {
        padding: '15px',
        textAlign: 'left',
        color: '#2c3e50',
        fontSize: '14px'
    },
    tr: {
        borderBottom: '1px solid #ecf0f1',
        ':hover': {
            backgroundColor: '#f5f5f5'
        }
    },
    td: {
        padding: '12px 15px',
        fontSize: '14px'
    },
    gradeBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px'
    },
    editButton: {
        padding: '5px 10px',
        marginRight: '5px',
        border: 'none',
        borderRadius: '3px',
        backgroundColor: '#f39c12',
        color: 'white',
        cursor: 'pointer'
    },
    deleteButton: {
        padding: '5px 10px',
        border: 'none',
        borderRadius: '3px',
        backgroundColor: '#e74c3c',
        color: 'white',
        cursor: 'pointer'
    }
};

export default StudentManagement;
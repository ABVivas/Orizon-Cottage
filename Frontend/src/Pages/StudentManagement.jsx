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
    const [formData, setFormData] = useState({
        id_estudiante: '',
        apellido: '',
        grado: 'preescolar',
        fecha_nacimiento: '',
        vereda: '',
        telefono: '',
        nombre_acudiente: '',
        cedula_padre: '',
        parentesco: 'PADRE'
    });

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
                setFilteredStudents(data.data);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = selectedStudent 
                ? `http://localhost:5000/api/students/${selectedStudent._id}`
                : 'http://localhost:5000/api/students';
            
            const method = selectedStudent ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (data.success) {
                setShowModal(false);
                fetchStudents();
                resetForm();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            id_estudiante: '',
            apellido: '',
            grado: 'preescolar',
            fecha_nacimiento: '',
            vereda: '',
            telefono: '',
            nombre_acudiente: '',
            cedula_padre: '',
            parentesco: 'PADRE'
        });
        setSelectedStudent(null);
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setFormData({
            id_estudiante: student.id_estudiante,
            apellido: student.apellido,
            grado: student.grado,
            fecha_nacimiento: student.fecha_nacimiento || '',
            vereda: student.vereda || '',
            telefono: student.telefono || '',
            nombre_acudiente: student.nombre_acudiente || '',
            cedula_padre: student.cedula_padre || '',
            parentesco: student.parentesco || 'PADRE'
        });
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
                        resetForm();
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
                                    <td style={styles.td}>{student.nombre_acudiente || '-'}</td>
                                    <td style={styles.td}>{student.telefono || '-'}</td>
                                    <td style={styles.td}>{student.vereda || '-'}</td>
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

            {/* Modal para crear/editar estudiante */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>
                            {selectedStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>ID Estudiante *</label>
                                    <input
                                        type="text"
                                        value={formData.id_estudiante}
                                        onChange={(e) => setFormData({...formData, id_estudiante: e.target.value})}
                                        required
                                        style={styles.input}
                                        disabled={selectedStudent}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Nombre Completo *</label>
                                    <input
                                        type="text"
                                        value={formData.apellido}
                                        onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                                        required
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Grado *</label>
                                    <select
                                        value={formData.grado}
                                        onChange={(e) => setFormData({...formData, grado: e.target.value})}
                                        required
                                        style={styles.select}
                                    >
                                        <option value="preescolar">Preescolar</option>
                                        <option value="primaria">Primaria</option>
                                        <option value="secundaria">Secundaria</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Fecha Nacimiento</label>
                                    <input
                                        type="date"
                                        value={formData.fecha_nacimiento}
                                        onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Vereda</label>
                                    <input
                                        type="text"
                                        value={formData.vereda}
                                        onChange={(e) => setFormData({...formData, vereda: e.target.value})}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Teléfono</label>
                                    <input
                                        type="text"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <h4 style={styles.subtitle}>Datos del Acudiente</h4>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Nombre del Acudiente *</label>
                                    <input
                                        type="text"
                                        value={formData.nombre_acudiente}
                                        onChange={(e) => setFormData({...formData, nombre_acudiente: e.target.value})}
                                        required
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Cédula del Acudiente *</label>
                                    <input
                                        type="text"
                                        value={formData.cedula_padre}
                                        onChange={(e) => setFormData({...formData, cedula_padre: e.target.value})}
                                        required
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Parentesco</label>
                                <select
                                    value={formData.parentesco}
                                    onChange={(e) => setFormData({...formData, parentesco: e.target.value})}
                                    style={styles.select}
                                >
                                    <option value="PADRE">Padre</option>
                                    <option value="MADRE">Madre</option>
                                    <option value="ABUELO">Abuelo(a)</option>
                                    <option value="TIO">Tío(a)</option>
                                    <option value="OTRO">Otro</option>
                                </select>
                            </div>

                            <div style={styles.modalButtons}>
                                <button 
                                    type="button" 
                                    style={styles.cancelButton}
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" style={styles.saveButton}>
                                    {selectedStudent ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
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
        borderBottom: '1px solid #ecf0f1'
    },
    td: {
        padding: '12px 15px',
        fontSize: '14px'
    },
    gradeBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-block'
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
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto'
    },
    modalTitle: {
        margin: '0 0 20px 0',
        color: '#2c3e50'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontWeight: 'bold',
        color: '#2c3e50',
        fontSize: '13px'
    },
    input: {
        padding: '8px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px'
    },
    select: {
        padding: '8px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    subtitle: {
        margin: '10px 0 5px',
        color: '#2c3e50',
        borderBottom: '1px solid #ecf0f1',
        paddingBottom: '5px'
    },
    modalButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '20px'
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    saveButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    }
};

export default StudentManagement;
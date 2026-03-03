// Frontend/src/Pages/TeacherManagement.jsx
import { useState, useEffect } from 'react';

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [formData, setFormData] = useState({
        numeroIdentificacion: '',
        nombre: '',
        email: '',
        telefono: '',
        cursosAsignados: [],
        activo: true,
        password: ''
    });

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        filterTeachers();
    }, [searchTerm, teachers]);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users?rol=docente', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setTeachers(data.users);
                setFilteredTeachers(data.users);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTeachers = () => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const filtered = teachers.filter(t => 
                t.nombre?.toLowerCase().includes(term) ||
                t.numeroIdentificacion?.includes(term) ||
                t.email?.toLowerCase().includes(term)
            );
            setFilteredTeachers(filtered);
        } else {
            setFilteredTeachers(teachers);
        }
    };

    const validateForm = () => {
        if (!formData.numeroIdentificacion || !formData.nombre) {
            alert('La identificación y el nombre son obligatorios');
            return false;
        }
        if (formData.email && !formData.email.includes('@')) {
            alert('El email no es válido');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            const token = localStorage.getItem('token');
            const url = selectedTeacher 
                ? `http://localhost:5000/api/users/${selectedTeacher._id}`
                : 'http://localhost:5000/api/auth/register';
            
            const method = selectedTeacher ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    rol: 'docente',
                    password: formData.password || 'Docente123*'
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setShowModal(false);
                fetchTeachers();
                resetForm();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            numeroIdentificacion: '',
            nombre: '',
            email: '',
            telefono: '',
            cursosAsignados: [],
            activo: true,
            password: ''
        });
        setSelectedTeacher(null);
    };

    const handleEdit = (teacher) => {
        setSelectedTeacher(teacher);
        setFormData({
            numeroIdentificacion: teacher.numeroIdentificacion,
            nombre: teacher.nombre,
            email: teacher.email || '',
            telefono: teacher.telefono || '',
            cursosAsignados: teacher.cursosAsignados || [],
            activo: teacher.activo,
            password: ''
        });
        setShowModal(true);
    };

    const toggleStatus = async (teacherId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/${teacherId}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ activo: !currentStatus })
            });
            const data = await response.json();
            if (data.success) {
                fetchTeachers();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const resetPassword = async (teacherId) => {
        if (!confirm('¿Está seguro de resetear la contraseña? Se generará una nueva contraseña temporal.')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/${teacherId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                alert(`✅ Nueva contraseña temporal: ${data.tempPassword}\n\nEl docente deberá cambiarla al iniciar sesión.`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al resetear la contraseña');
        }
    };

    return (
        <div>
            <div style={styles.header}>
                <h2 style={styles.title}>Gestión de Docentes</h2>
                <button 
                    style={styles.addButton}
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    + Nuevo Docente
                </button>
            </div>

            <div style={styles.filters}>
                <input
                    type="text"
                    placeholder="Buscar por nombre, ID o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Identificación</th>
                                <th style={styles.th}>Nombre</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Teléfono</th>
                                <th style={styles.th}>Cursos</th>
                                <th style={styles.th}>Estado</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map((teacher) => (
                                <tr key={teacher._id} style={styles.tr}>
                                    <td style={styles.td}>{teacher.numeroIdentificacion}</td>
                                    <td style={styles.td}>{teacher.nombre}</td>
                                    <td style={styles.td}>{teacher.email || '-'}</td>
                                    <td style={styles.td}>{teacher.telefono || '-'}</td>
                                    <td style={styles.td}>
                                        {teacher.cursosAsignados?.length > 0 
                                            ? teacher.cursosAsignados.join(', ') 
                                            : 'Sin asignar'}
                                    </td>
                                    <td style={styles.td}>
                                        <span className={`status-badge ${teacher.activo ? 'status-active' : 'status-inactive'}`}>
                                            {teacher.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            style={styles.editButton}
                                            onClick={() => handleEdit(teacher)}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            style={styles.statusButton}
                                            onClick={() => toggleStatus(teacher._id, teacher.activo)}
                                            title={teacher.activo ? 'Desactivar' : 'Activar'}
                                        >
                                            {teacher.activo ? '🔒' : '🔓'}
                                        </button>
                                        <button 
                                            style={styles.resetButton}
                                            onClick={() => resetPassword(teacher._id)}
                                            title="Resetear contraseña"
                                        >
                                            🔑
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para crear/editar docente */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>
                            {selectedTeacher ? 'Editar Docente' : 'Nuevo Docente'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Identificación *</label>
                                    <input
                                        type="text"
                                        value={formData.numeroIdentificacion}
                                        onChange={(e) => setFormData({...formData, numeroIdentificacion: e.target.value})}
                                        required
                                        style={styles.input}
                                        disabled={selectedTeacher}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Nombre Completo *</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                        required
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
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

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Cursos Asignados (separados por coma)</label>
                                <input
                                    type="text"
                                    value={formData.cursosAsignados.join(', ')}
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        cursosAsignados: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                                    })}
                                    placeholder="Ej: 6A, 7A, 8B"
                                    style={styles.input}
                                />
                                <small style={styles.helpText}>Ingrese los cursos separados por coma</small>
                            </div>

                            {!selectedTeacher && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Contraseña (dejar vacío para generar automática)</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        style={styles.input}
                                        placeholder="Docente123* por defecto"
                                    />
                                </div>
                            )}

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
                                    {selectedTeacher ? 'Actualizar' : 'Guardar'}
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
        marginBottom: '25px'
    },
    searchInput: {
        width: '100%',
        padding: '12px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        boxSizing: 'border-box'
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
    editButton: {
        padding: '5px 10px',
        marginRight: '5px',
        border: 'none',
        borderRadius: '3px',
        backgroundColor: '#f39c12',
        color: 'white',
        cursor: 'pointer'
    },
    statusButton: {
        padding: '5px 10px',
        marginRight: '5px',
        border: 'none',
        borderRadius: '3px',
        backgroundColor: '#3498db',
        color: 'white',
        cursor: 'pointer'
    },
    resetButton: {
        padding: '5px 10px',
        border: 'none',
        borderRadius: '3px',
        backgroundColor: '#27ae60',
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
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    helpText: {
        fontSize: '12px',
        color: '#7f8c8d',
        marginTop: '3px'
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

export default TeacherManagement;
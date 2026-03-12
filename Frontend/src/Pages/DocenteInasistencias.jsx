// Frontend/src/Pages/DocenteInasistencias.jsx
import { useState, useEffect } from 'react';

const DocenteInasistencias = ({ user }) => {
    const [cursos, setCursos] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState('');
    const [selectedEstudiante, setSelectedEstudiante] = useState('');
    const [loading, setLoading] = useState(true);
    const [asistenciasHoy, setAsistenciasHoy] = useState([]);

    useEffect(() => {
        fetchCursos();
        fetchAsistenciasHoy();
    }, [user]);

    const fetchCursos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/students/docente/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            // Extraer cursos únicos
            const uniqueCursos = [...new Set(data.data.map(e => e.grado_especifico))];
            setCursos(uniqueCursos);
            setEstudiantes(data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAsistenciasHoy = async () => {
        try {
            const token = localStorage.getItem('token');
            const hoy = new Date().toISOString().split('T')[0];
            const response = await fetch(`http://localhost:5000/api/attendance/docente/${user.id}?fecha=${hoy}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setAsistenciasHoy(data.data || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const marcarAsistencia = async (estudianteId, estado) => {
        try {
            const token = localStorage.getItem('token');
            const hoy = new Date().toISOString().split('T')[0];
            
            const response = await fetch('http://localhost:5000/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: estudianteId,
                    fecha: hoy,
                    estado,
                    registradoPor: user.id
                })
            });
            
            if (response.ok) {
                fetchAsistenciasHoy();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const estudiantesFiltrados = selectedCurso 
        ? estudiantes.filter(e => e.grado_especifico === selectedCurso)
        : [];

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Registro de Inasistencias</h2>
            <p style={styles.subtitle}>Marque las ausencias de los estudiantes</p>

            {/* Nueva Inasistencia */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Nueva Inasistencia</h3>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Curso</label>
                    <select 
                        style={styles.select}
                        value={selectedCurso}
                        onChange={(e) => setSelectedCurso(e.target.value)}
                    >
                        <option value="">Seleccione un curso</option>
                        {cursos.map(curso => (
                            <option key={curso} value={curso}>{curso}</option>
                        ))}
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Estudiante</label>
                    <select 
                        style={styles.select}
                        value={selectedEstudiante}
                        onChange={(e) => setSelectedEstudiante(e.target.value)}
                        disabled={!selectedCurso}
                    >
                        <option value="">Seleccione un estudiante</option>
                        {estudiantesFiltrados.map(e => (
                            <option key={e._id} value={e._id}>
                                {e.apellido1 || e.apellido}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={styles.buttonGroup}>
                    <button 
                        style={{...styles.button, backgroundColor: '#27ae60'}}
                        onClick={() => marcarAsistencia(selectedEstudiante, 'presente')}
                        disabled={!selectedEstudiante}
                    >
                        Marcar Presente
                    </button>
                    <button 
                        style={{...styles.button, backgroundColor: '#e74c3c'}}
                        onClick={() => marcarAsistencia(selectedEstudiante, 'ausente')}
                        disabled={!selectedEstudiante}
                    >
                        Marcar Ausente
                    </button>
                    <button 
                        style={{...styles.button, backgroundColor: '#f39c12'}}
                        onClick={() => marcarAsistencia(selectedEstudiante, 'tarde')}
                        disabled={!selectedEstudiante}
                    >
                        Marcar Tardanza
                    </button>
                </div>
            </div>

            {/* Lista de Asistencia - Hoy */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Lista de Asistencia - Hoy</h3>
                
                {estudiantes.length === 0 ? (
                    <p style={styles.emptyMessage}>No hay estudiantes asignados</p>
                ) : (
                    estudiantes.map(est => {
                        const asistenciaHoy = asistenciasHoy.find(a => a.studentId === est._id);
                        return (
                            <div key={est._id} style={styles.studentRow}>
                                <span style={styles.studentName}>
                                    {est.apellido1 || est.apellido} - {est.grado_especifico}
                                </span>
                                <div style={styles.rowButtons}>
                                    <button 
                                        style={{
                                            ...styles.smallButton,
                                            backgroundColor: asistenciaHoy?.estado === 'presente' ? '#27ae60' : '#95a5a6'
                                        }}
                                        onClick={() => marcarAsistencia(est._id, 'presente')}
                                    >
                                        Presente
                                    </button>
                                    <button 
                                        style={{
                                            ...styles.smallButton,
                                            backgroundColor: asistenciaHoy?.estado === 'ausente' ? '#e74c3c' : '#95a5a6'
                                        }}
                                        onClick={() => marcarAsistencia(est._id, 'ausente')}
                                    >
                                        Ausente
                                    </button>
                                    <button 
                                        style={{
                                            ...styles.smallButton,
                                            backgroundColor: asistenciaHoy?.estado === 'tarde' ? '#f39c12' : '#95a5a6'
                                        }}
                                        onClick={() => marcarAsistencia(est._id, 'tarde')}
                                    >
                                        Tardanza
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px'
    },
    title: {
        margin: '0 0 5px 0',
        color: '#2c3e50',
        fontSize: '22px'
    },
    subtitle: {
        margin: '0 0 30px 0',
        color: '#7f8c8d',
        fontSize: '14px'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '20px',
        marginBottom: '30px'
    },
    cardTitle: {
        margin: '0 0 20px 0',
        color: '#2c3e50',
        fontSize: '18px',
        paddingBottom: '10px',
        borderBottom: '2px solid #27ae60'
    },
    formGroup: {
        marginBottom: '15px'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    select: {
        width: '100%',
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px'
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px'
    },
    button: {
        flex: 1,
        padding: '12px',
        border: 'none',
        borderRadius: '5px',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '14px'
    },
    studentRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        borderBottom: '1px solid #ecf0f1'
    },
    studentName: {
        fontWeight: '500',
        color: '#2c3e50'
    },
    rowButtons: {
        display: 'flex',
        gap: '8px'
    },
    smallButton: {
        padding: '5px 10px',
        border: 'none',
        borderRadius: '3px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '12px'
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#95a5a6',
        padding: '20px'
    }
};

export default DocenteInasistencias;
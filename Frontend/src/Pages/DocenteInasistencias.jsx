// Frontend/src/Pages/DocenteInasistencias.jsx
import { useState, useEffect } from 'react';

const DocenteInasistencias = ({ user }) => {
    const [cursos, setCursos] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState('');
    const [selectedEstudiante, setSelectedEstudiante] = useState('');
    const [asistenciasHoy, setAsistenciasHoy] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para el modal de motivo
    const [showMotivoModal, setShowMotivoModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [currentEstado, setCurrentEstado] = useState('');
    const [motivoData, setMotivoData] = useState({
        motivo: 'enfermedad',
        observacion: ''
    });

    // Obtener fecha actual en formato YYYY-MM-DD (CORREGIDO para zona horaria)
    const today = new Date().toLocaleDateString('en-CA');

    useEffect(() => {
        if (user?.id) {
            fetchCursosYEstudiantes();
        }
    }, [user]);

    useEffect(() => {
        if (selectedCurso) {
            fetchAsistenciasHoy();
        }
    }, [selectedCurso, today]);

    const fetchCursosYEstudiantes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/students/docente/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                const uniqueCursos = [...new Set(data.data.map(e => e.grado_especifico))];
                setCursos(uniqueCursos);
                setEstudiantes(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAsistenciasHoy = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/attendance?date=${today}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                setAsistenciasHoy(data.attendance || []);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const estudiantesFiltrados = selectedCurso 
        ? estudiantes.filter(e => e.grado_especifico === selectedCurso)
        : [];

    const getStudentAttendance = (studentId) => {
        const record = asistenciasHoy.find(a => a.studentId?._id === studentId || a.studentId === studentId);
        return record?.estado || 'sin-registrar';
    };

    const handleAttendanceClick = (student, estado) => {
        if (estado === 'presente') {
            registerAttendance(student._id, estado, '', '');
        } else {
            setCurrentStudent(student);
            setCurrentEstado(estado);
            setMotivoData({ motivo: 'enfermedad', observacion: '' });
            setShowMotivoModal(true);
        }
    };

    const registerAttendance = async (studentId, estado, motivo, observacion) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId,
                    fecha: today,
                    estado,
                    motivo: motivo || '',
                    observacion: observacion || '',
                    registradoPor: user.id
                })
            });

            if (response.ok) {
                await fetchAsistenciasHoy();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    };

    const handleMotivoSubmit = async () => {
        if (currentStudent && currentEstado) {
            const success = await registerAttendance(
                currentStudent._id,
                currentEstado,
                motivoData.motivo,
                motivoData.observacion
            );
            
            if (success) {
                setShowMotivoModal(false);
                setCurrentStudent(null);
                setCurrentEstado('');
            } else {
                alert('Error al registrar la asistencia');
            }
        }
    };

    const getEstadoBadge = (estado) => {
        switch(estado) {
            case 'presente':
                return { bg: '#27ae60', text: 'Presente' };
            case 'ausente':
                return { bg: '#e74c3c', text: 'Ausente' };
            case 'tarde':
                return { bg: '#f39c12', text: 'Tardanza' };
            default:
                return { bg: '#95a5a6', text: 'Sin registrar' };
        }
    };

    const motivoMap = {
        'enfermedad': 'Enfermedad',
        'permiso': 'Permiso',
        'sin_justificar': 'Sin justificar',
        'otro': 'Otro'
    };

    if (loading) {
        return <div style={styles.loading}>Cargando...</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Registro de Inasistencias</h2>
            <p style={styles.pageSubtitle}>Marque las ausencias de los estudiantes</p>

            {/* Nueva Inasistencia - Selector rápido */}
            <div style={styles.formCard}>
                <h3 style={styles.formTitle}>Nueva Inasistencia</h3>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Curso</label>
                    <select 
                        style={styles.select}
                        value={selectedCurso}
                        onChange={(e) => {
                            setSelectedCurso(e.target.value);
                            setSelectedEstudiante('');
                        }}
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
                        onClick={() => {
                            const student = estudiantesFiltrados.find(e => e._id === selectedEstudiante);
                            if (student) handleAttendanceClick(student, 'presente');
                        }}
                        disabled={!selectedEstudiante}
                    >
                        Marcar Presente
                    </button>
                    <button 
                        style={{...styles.button, backgroundColor: '#e74c3c'}}
                        onClick={() => {
                            const student = estudiantesFiltrados.find(e => e._id === selectedEstudiante);
                            if (student) handleAttendanceClick(student, 'ausente');
                        }}
                        disabled={!selectedEstudiante}
                    >
                        Marcar Ausente
                    </button>
                    <button 
                        style={{...styles.button, backgroundColor: '#f39c12'}}
                        onClick={() => {
                            const student = estudiantesFiltrados.find(e => e._id === selectedEstudiante);
                            if (student) handleAttendanceClick(student, 'tarde');
                        }}
                        disabled={!selectedEstudiante}
                    >
                        Marcar Tardanza
                    </button>
                </div>
            </div>

            {/* Lista de Asistencia - Hoy */}
            <div style={styles.listCard}>
                <h3 style={styles.listTitle}>Lista de Asistencia - Hoy</h3>
                
                {estudiantesFiltrados.length === 0 ? (
                    <p style={styles.emptyMessage}>Seleccione un curso para ver los estudiantes</p>
                ) : (
                    <div style={styles.studentList}>
                        {estudiantesFiltrados.map(est => {
                            const estadoActual = getStudentAttendance(est._id);
                            const record = asistenciasHoy.find(a => a.studentId?._id === est._id || a.studentId === est._id);
                            const motivoTexto = record?.motivo ? motivoMap[record.motivo] : '';
                            
                            return (
                                <div key={est._id} style={styles.studentRow}>
                                    <div style={styles.studentInfo}>
                                        <span style={styles.studentName}>
                                            {est.apellido1 || est.apellido}
                                        </span>
                                        <span style={styles.studentGrade}>{est.grado_especifico}</span>
                                        {motivoTexto && (
                                            <span style={styles.motivoText}> - {motivoTexto}</span>
                                        )}
                                    </div>
                                    <div style={styles.rowButtons}>
                                        <button
                                            style={{
                                                ...styles.smallButton,
                                                backgroundColor: estadoActual === 'presente' ? '#27ae60' : '#ecf0f1',
                                                color: estadoActual === 'presente' ? 'white' : '#2c3e50'
                                            }}
                                            onClick={() => handleAttendanceClick(est, 'presente')}
                                        >
                                            Presente
                                        </button>
                                        <button
                                            style={{
                                                ...styles.smallButton,
                                                backgroundColor: estadoActual === 'ausente' ? '#e74c3c' : '#ecf0f1',
                                                color: estadoActual === 'ausente' ? 'white' : '#2c3e50'
                                            }}
                                            onClick={() => handleAttendanceClick(est, 'ausente')}
                                        >
                                            Ausente
                                        </button>
                                        <button
                                            style={{
                                                ...styles.smallButton,
                                                backgroundColor: estadoActual === 'tarde' ? '#f39c12' : '#ecf0f1',
                                                color: estadoActual === 'tarde' ? 'white' : '#2c3e50'
                                            }}
                                            onClick={() => handleAttendanceClick(est, 'tarde')}
                                        >
                                            Tardanza
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal para registrar motivo de ausencia/tardanza */}
            {showMotivoModal && currentStudent && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>
                            Registrar {currentEstado === 'ausente' ? 'Ausencia' : 'Tardanza'}
                        </h3>
                        <p style={styles.modalSubtitle}>
                            Estudiante: <strong>{currentStudent.apellido1 || currentStudent.apellido}</strong>
                        </p>

                        <div style={styles.modalContent}>
                            <div style={styles.formGroup}>
                                <label style={styles.modalLabel}>Motivo:</label>
                                <div style={styles.radioGroup}>
                                    <label style={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="motivo"
                                            value="enfermedad"
                                            checked={motivoData.motivo === 'enfermedad'}
                                            onChange={(e) => setMotivoData({...motivoData, motivo: e.target.value})}
                                        />
                                        Enfermedad
                                    </label>
                                    <label style={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="motivo"
                                            value="permiso"
                                            checked={motivoData.motivo === 'permiso'}
                                            onChange={(e) => setMotivoData({...motivoData, motivo: e.target.value})}
                                        />
                                        Permiso
                                    </label>
                                    <label style={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="motivo"
                                            value="sin_justificar"
                                            checked={motivoData.motivo === 'sin_justificar'}
                                            onChange={(e) => setMotivoData({...motivoData, motivo: e.target.value})}
                                        />
                                        Sin justificar
                                    </label>
                                    <label style={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="motivo"
                                            value="otro"
                                            checked={motivoData.motivo === 'otro'}
                                            onChange={(e) => setMotivoData({...motivoData, motivo: e.target.value})}
                                        />
                                        Otro
                                    </label>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.modalLabel}>Observaciones (opcional):</label>
                                <textarea
                                    value={motivoData.observacion}
                                    onChange={(e) => setMotivoData({...motivoData, observacion: e.target.value})}
                                    style={styles.textarea}
                                    rows="3"
                                    placeholder="Ingrese observaciones adicionales..."
                                />
                            </div>
                        </div>

                        <div style={styles.modalButtons}>
                            <button style={styles.cancelButton} onClick={() => setShowMotivoModal(false)}>
                                Cancelar
                            </button>
                            <button style={styles.saveButton} onClick={handleMotivoSubmit}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1000px',
        margin: '0 auto'
    },
    loading: {
        textAlign: 'center',
        padding: '50px'
    },
    pageTitle: {
        margin: '0 0 8px 0',
        fontSize: '28px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    pageSubtitle: {
        margin: '0 0 32px 0',
        fontSize: '16px',
        color: '#7f8c8d'
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        padding: '24px',
        marginBottom: '24px'
    },
    formTitle: {
        margin: '0 0 20px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        borderBottom: '2px solid #27ae60',
        paddingBottom: '8px'
    },
    listCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        padding: '24px'
    },
    listTitle: {
        margin: '0 0 20px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        borderBottom: '2px solid #27ae60',
        paddingBottom: '8px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#2c3e50',
        fontSize: '14px'
    },
    select: {
        width: '100%',
        padding: '12px',
        border: '1px solid #dcdfe6',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        marginTop: '20px'
    },
    button: {
        flex: 1,
        padding: '12px',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s'
    },
    studentList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    studentRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    },
    studentInfo: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    studentName: {
        fontWeight: '600',
        color: '#2d3748'
    },
    studentGrade: {
        padding: '2px 8px',
        backgroundColor: '#e2e8f0',
        borderRadius: '20px',
        fontSize: '12px',
        color: '#4a5568'
    },
    motivoText: {
        fontSize: '12px',
        color: '#718096',
        fontStyle: 'italic'
    },
    rowButtons: {
        display: 'flex',
        gap: '8px'
    },
    smallButton: {
        padding: '6px 12px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#a0aec0',
        padding: '40px'
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
        borderRadius: '16px',
        padding: '24px',
        width: '90%',
        maxWidth: '450px'
    },
    modalTitle: {
        margin: '0 0 8px 0',
        fontSize: '20px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    modalSubtitle: {
        margin: '0 0 20px 0',
        fontSize: '14px',
        color: '#7f8c8d'
    },
    modalContent: {
        marginBottom: '20px'
    },
    modalLabel: {
        display: 'block',
        marginBottom: '10px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    radioGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #dcdfe6',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical'
    },
    modalButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '20px'
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    saveButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
    }
};

export default DocenteInasistencias;
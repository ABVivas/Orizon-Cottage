// Frontend/src/Pages/AttendanceControl.jsx
import { useState, useEffect } from 'react';

const AttendanceControl = () => {
    const [attendance, setAttendance] = useState([]);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedGrade, setSelectedGrade] = useState('todos');
    const [selectedSpecificGrade, setSelectedSpecificGrade] = useState('todos');
    const [loading, setLoading] = useState(false);
    const [showMotivoModal, setShowMotivoModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [currentEstado, setCurrentEstado] = useState('');
    const [motivoData, setMotivoData] = useState({
        motivo: 'enfermedad',
        observacion: ''
    });
    const [stats, setStats] = useState({
        present: 0,
        absent: 0,
        late: 0,
        total: 0
    });

    // Mapeo de grados generales a grados específicos (ahora con 0° para preescolar)
    const gradeMapping = {
        'preescolar': ['0°'],
        'primaria': ['1°', '2°', '3°', '4°', '5°'],
        'secundaria': ['6°', '7°', '8°', '9°', '10°', '11°']
    };

    // Mapeo de motivos para mostrar en español
    const motivoMap = {
        'enfermedad': 'Enfermedad',
        'permiso': 'Permiso',
        'sin_justificar': 'Sin justificar',
        'otro': 'Otro'
    };

    const [specificOptions, setSpecificOptions] = useState([]);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchAttendance();
        }
    }, [selectedDate]);

    useEffect(() => {
        applyFilters();
    }, [selectedGrade, selectedSpecificGrade, students]);

    useEffect(() => {
        // Cada vez que cambia attendance, recalcular estadísticas y forzar actualización
        calculateStats();
        console.log('📊 Attendance actualizado:', attendance);
    }, [attendance, filteredStudents]);

    useEffect(() => {
        if (selectedGrade !== 'todos') {
            setSpecificOptions(gradeMapping[selectedGrade] || []);
            setSelectedSpecificGrade('todos');
        } else {
            setSpecificOptions([]);
            setSelectedSpecificGrade('todos');
        }
    }, [selectedGrade]);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/students', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                console.log('📚 Estudiantes cargados:', data.data.length);
                setStudents(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/attendance?date=${selectedDate}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            console.log('📊 Datos de asistencia recibidos:', data);
            if (data.success) {
                setAttendance(data.attendance || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...students];
        
        // Filtrar por grado general
        if (selectedGrade !== 'todos') {
            filtered = filtered.filter(s => {
                const gradoEsp = s.grado_especifico;
                if (!gradoEsp) return false;
                
                if (selectedGrade === 'preescolar') {
                    return gradoEsp === '0°';
                } else if (selectedGrade === 'primaria') {
                    return ['1°', '2°', '3°', '4°', '5°'].includes(gradoEsp);
                } else if (selectedGrade === 'secundaria') {
                    return ['6°', '7°', '8°', '9°', '10°', '11°'].includes(gradoEsp);
                }
                return false;
            });
        }
        
        // Filtrar por grado específico
        if (selectedSpecificGrade !== 'todos') {
            filtered = filtered.filter(s => s.grado_especifico === selectedSpecificGrade);
        }
        
        setFilteredStudents(filtered);
    };

    const calculateStats = () => {
        // Convertir IDs a string para comparación segura
        const filteredStudentIds = filteredStudents.map(s => s._id.toString());
        const relevantAttendance = attendance.filter(a => 
            filteredStudentIds.includes(a.studentId.toString())
        );
        
        const newStats = {
            present: relevantAttendance.filter(a => a.estado === 'presente').length,
            absent: relevantAttendance.filter(a => a.estado === 'ausente').length,
            late: relevantAttendance.filter(a => a.estado === 'tarde').length,
            total: relevantAttendance.length
        };
        
        console.log('📊 Estadísticas calculadas:', newStats);
        console.log('   IDs filtrados:', filteredStudentIds);
        console.log('   Asistencias relevantes:', relevantAttendance);
        
        setStats(newStats);
    };

    const handleAttendanceClick = (student, estado) => {
        if (estado === 'presente') {
            handleAttendanceChange(student._id, estado, '', '');
        } else {
            setCurrentStudent(student);
            setCurrentEstado(estado);
            setMotivoData({ motivo: 'enfermedad', observacion: '' });
            setShowMotivoModal(true);
        }
    };

    const handleAttendanceChange = async (studentId, estado, motivo, observacion) => {
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
                    fecha: selectedDate,
                    estado,
                    motivo: motivo || '',
                    observacion: observacion || '',
                    registradoPor: 'admin'
                })
            });
            const data = await response.json();
            console.log('📥 Respuesta del servidor:', data);
            if (data.success) {
                // Refrescar los datos después de guardar
                await fetchAttendance();
            }
        } catch (error) {
            console.error('❌ Error:', error);
        }
    };

    const handleMotivoSubmit = () => {
        if (currentStudent && currentEstado) {
            handleAttendanceChange(
                currentStudent._id, 
                currentEstado, 
                motivoData.motivo, 
                motivoData.observacion
            );
            setShowMotivoModal(false);
            setCurrentStudent(null);
            setCurrentEstado('');
        }
    };

    const getStudentAttendance = (studentId) => {
        // Convertir a string para comparación
        const studentIdStr = studentId.toString();
        const record = attendance.find(a => a.studentId.toString() === studentIdStr);
        const estado = record?.estado || 'sin-registrar';
        
        // Log solo para el estudiante que nos interesa
        if (studentIdStr.includes('69b17eb41de0494bfdffc006')) {
            console.log('🔍 Buscando estudiante:', studentIdStr);
            console.log('   Registro encontrado:', record);
            console.log('   Estado:', estado);
        }
        
        return estado;
    };

    const getStudentMotivo = (studentId) => {
        const studentIdStr = studentId.toString();
        const record = attendance.find(a => a.studentId.toString() === studentIdStr);
        if (record && record.motivo && record.motivo !== '') {
            return motivoMap[record.motivo] || record.motivo;
        }
        return '-';
    };

    const getStudentObservacion = (studentId) => {
        const studentIdStr = studentId.toString();
        const record = attendance.find(a => a.studentId.toString() === studentIdStr);
        return (record && record.observacion && record.observacion !== '') ? record.observacion : '-';
    };

    const getGradeDisplay = (student) => {
        return student.grado_especifico || student.grado || 'N/A';
    };

    const handleGradeChange = (e) => {
        setSelectedGrade(e.target.value);
        setSelectedSpecificGrade('todos');
    };

    return (
        <div>
            <h2 style={styles.title}>Control de Inasistencias</h2>

            <div style={styles.filters}>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Fecha:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={styles.dateInput}
                    />
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Grado General:</label>
                    <select
                        value={selectedGrade}
                        onChange={handleGradeChange}
                        style={styles.gradeSelect}
                    >
                        <option value="todos">Todos los grados</option>
                        <option value="preescolar">Preescolar</option>
                        <option value="primaria">Primaria</option>
                        <option value="secundaria">Secundaria</option>
                    </select>
                </div>

                {specificOptions.length > 0 && (
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Grado Específico:</label>
                        <select
                            value={selectedSpecificGrade}
                            onChange={(e) => setSelectedSpecificGrade(e.target.value)}
                            style={styles.gradeSelect}
                        >
                            <option value="todos">Todos los grados</option>
                            {specificOptions.map(grade => (
                                <option key={grade} value={grade}>{grade}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div style={styles.statsContainer}>
                <div style={styles.statBox}>
                    <span style={styles.statValue}>{stats.present}</span>
                    <span style={styles.statLabel}>Presentes</span>
                </div>
                <div style={styles.statBox}>
                    <span style={styles.statValue}>{stats.absent}</span>
                    <span style={styles.statLabel}>Ausentes</span>
                </div>
                <div style={styles.statBox}>
                    <span style={styles.statValue}>{stats.late}</span>
                    <span style={styles.statLabel}>Tardanzas</span>
                </div>
                <div style={styles.statBox}>
                    <span style={styles.statValue}>{stats.total}</span>
                    <span style={styles.statLabel}>Total Registrados</span>
                </div>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>#</th>
                                <th style={styles.th}>Estudiante</th>
                                <th style={styles.th}>Grado</th>
                                <th style={styles.th}>Estado</th>
                                <th style={styles.th}>Motivo</th>
                                <th style={styles.th}>Observaciones</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => {
                                    const estado = getStudentAttendance(student._id);
                                    const motivo = getStudentMotivo(student._id);
                                    const observacion = getStudentObservacion(student._id);
                                    
                                    return (
                                        <tr key={student._id} style={styles.tr}>
                                            <td style={styles.td}>{index + 1}</td>
                                            <td style={styles.td}>
                                                <strong>{student.apellido1 || student.apellido || 'N/A'}</strong>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.gradeBadge,
                                                    backgroundColor: 
                                                        student.grado_especifico === '0°' ? '#27ae60' :
                                                        ['1°', '2°', '3°', '4°', '5°'].includes(student.grado_especifico) ? '#2980b9' : 
                                                        ['6°', '7°', '8°', '9°', '10°', '11°'].includes(student.grado_especifico) ? '#8e44ad' : '#95a5a6'
                                                }}>
                                                    {getGradeDisplay(student)}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: estado === 'presente' ? '#27ae60' :
                                                                    estado === 'ausente' ? '#e74c3c' :
                                                                    estado === 'tarde' ? '#f39c12' : '#95a5a6',
                                                    color: 'white'
                                                }}>
                                                    {estado === 'sin-registrar' ? 'Sin registrar' : 
                                                     estado === 'presente' ? 'Presente' :
                                                     estado === 'ausente' ? 'Ausente' : 'Tarde'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                {motivo}
                                            </td>
                                            <td style={styles.td}>
                                                {observacion}
                                            </td>
                                            <td style={styles.td}>
                                                <button 
                                                    style={{...styles.actionButton, backgroundColor: '#27ae60'}}
                                                    onClick={() => handleAttendanceClick(student, 'presente')}
                                                    title="Marcar presente"
                                                >
                                                    ✅
                                                </button>
                                                <button 
                                                    style={{...styles.actionButton, backgroundColor: '#e74c3c'}}
                                                    onClick={() => handleAttendanceClick(student, 'ausente')}
                                                    title="Marcar ausente"
                                                >
                                                    ❌
                                                </button>
                                                <button 
                                                    style={{...styles.actionButton, backgroundColor: '#f39c12'}}
                                                    onClick={() => handleAttendanceClick(student, 'tarde')}
                                                    title="Marcar tarde"
                                                >
                                                    ⏰
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" style={styles.emptyMessage}>
                                        No hay estudiantes para mostrar con los filtros seleccionados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

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
                            <button 
                                style={styles.cancelButton}
                                onClick={() => setShowMotivoModal(false)}
                            >
                                Cancelar
                            </button>
                            <button 
                                style={styles.saveButton}
                                onClick={handleMotivoSubmit}
                            >
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
    title: {
        color: '#2c3e50',
        marginBottom: '30px',
        fontSize: '22px'
    },
    filters: {
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        flexWrap: 'wrap'
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        minWidth: '150px'
    },
    filterLabel: {
        fontWeight: 'bold',
        color: '#2c3e50',
        fontSize: '13px'
    },
    dateInput: {
        padding: '8px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px'
    },
    gradeSelect: {
        padding: '8px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        minWidth: '150px',
        backgroundColor: 'white'
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '30px'
    },
    statBox: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    statValue: {
        display: 'block',
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    statLabel: {
        display: 'block',
        marginTop: '5px',
        color: '#7f8c8d',
        fontSize: '14px'
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
        fontSize: '14px',
        fontWeight: 'bold'
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
    statusBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-block'
    },
    actionButton: {
        margin: '0 5px',
        padding: '5px 8px',
        border: 'none',
        borderRadius: '3px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px'
    },
    emptyMessage: {
        textAlign: 'center',
        padding: '40px',
        color: '#95a5a6'
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
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto'
    },
    modalTitle: {
        margin: '0 0 5px 0',
        color: '#2c3e50'
    },
    modalSubtitle: {
        margin: '0 0 20px 0',
        color: '#7f8c8d',
        fontSize: '14px'
    },
    modalContent: {
        marginBottom: '20px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    modalLabel: {
        display: 'block',
        marginBottom: '10px',
        fontWeight: 'bold',
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
        cursor: 'pointer'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box'
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

export default AttendanceControl;
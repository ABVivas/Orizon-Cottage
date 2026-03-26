// Frontend/src/Pages/AdminAttendanceControl.jsx
import { useState, useEffect } from 'react';

const AdminAttendanceControl = () => {
    const [attendance, setAttendance] = useState([]);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [selectedGrade, setSelectedGrade] = useState('todos');
    const [selectedSpecificGrade, setSelectedSpecificGrade] = useState('todos');
    const [loading, setLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [editData, setEditData] = useState({ estado: '', motivo: '', observacion: '' });
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const gradeMapping = { 'preescolar': ['0°'], 'primaria': ['1°', '2°', '3°', '4°', '5°'], 'secundaria': ['6°', '7°', '8°', '9°', '10°', '11°'] };
    const motivoMap = { 'enfermedad': 'Enfermedad', 'permiso': 'Permiso', 'sin_justificar': 'Sin justificar', 'otro': 'Otro' };
    const [specificOptions, setSpecificOptions] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState(new Map());

    useEffect(() => { fetchStudents(); }, []);
    useEffect(() => { if (selectedDate) fetchAttendance(); }, [selectedDate]);
    useEffect(() => { applyFilters(); setCurrentPage(1); }, [selectedGrade, selectedSpecificGrade, students]);
    useEffect(() => { calculateStats(); }, [attendanceMap, filteredStudents]);
    useEffect(() => {
        if (selectedGrade !== 'todos') { setSpecificOptions(gradeMapping[selectedGrade] || []); setSelectedSpecificGrade('todos'); }
        else { setSpecificOptions([]); setSelectedSpecificGrade('todos'); }
    }, [selectedGrade]);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/students', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                console.log('📚 Estudiantes cargados:', data.data.length);
                setStudents(data.data);
            }
        } catch (error) { console.error('Error:', error); }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/attendance?date=${selectedDate}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                console.log(`📊 Asistencia para ${selectedDate}:`, data.attendance?.length || 0, 'registros');
                if (data.attendance?.length > 0) {
                    console.log('📝 Ejemplo de registro:', data.attendance[0]);
                }
                setAttendance(data.attendance || []);
            }
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    // Actualizar el mapa de asistencias cada vez que cambia attendance
    useEffect(() => {
        const newMap = new Map();
        attendance.forEach(record => {
            let studentId = null;
            if (record.studentId) {
                if (typeof record.studentId === 'object' && record.studentId._id) {
                    studentId = record.studentId._id.toString();
                } else if (typeof record.studentId === 'string') {
                    studentId = record.studentId;
                } else if (record.studentId.toString) {
                    studentId = record.studentId.toString();
                }
            }
            if (studentId) {
                newMap.set(studentId, record);
            }
        });
        setAttendanceMap(newMap);
        console.log('🗺️ Mapa de asistencias actualizado:', newMap.size, 'registros para la fecha', selectedDate);
    }, [attendance, selectedDate]);

    const applyFilters = () => {
        let filtered = [...students];
        if (selectedGrade !== 'todos') {
            filtered = filtered.filter(s => {
                const gradoEsp = s.grado_especifico;
                if (!gradoEsp) return false;
                if (selectedGrade === 'preescolar') return gradoEsp === '0°';
                if (selectedGrade === 'primaria') return ['1°', '2°', '3°', '4°', '5°'].includes(gradoEsp);
                if (selectedGrade === 'secundaria') return ['6°', '7°', '8°', '9°', '10°', '11°'].includes(gradoEsp);
                return false;
            });
        }
        if (selectedSpecificGrade !== 'todos') filtered = filtered.filter(s => s.grado_especifico === selectedSpecificGrade);
        setFilteredStudents(filtered);
        console.log('🔍 Estudiantes filtrados:', filtered.length);
    };

    const calculateStats = () => {
        let present = 0, absent = 0, late = 0;
        
        filteredStudents.forEach(student => {
            const studentId = student._id.toString();
            const record = attendanceMap.get(studentId);
            
            if (record) {
                if (record.estado === 'presente') present++;
                else if (record.estado === 'ausente') absent++;
                else if (record.estado === 'tarde') late++;
            }
        });
        
        console.log('📊 ESTADÍSTICAS:', { 
            fecha: selectedDate,
            presentes: present, 
            ausentes: absent, 
            tardanzas: late
        });
        setStats({ present, absent, late });
    };

    const getStudentRecord = (studentId) => {
        const id = studentId.toString();
        return attendanceMap.get(id);
    };

    const getStudentAttendance = (studentId) => {
        const record = getStudentRecord(studentId);
        return record?.estado || 'sin-registrar';
    };
    
    const getStudentMotivo = (studentId) => {
        const record = getStudentRecord(studentId);
        if (record && record.motivo && record.motivo !== '') {
            return motivoMap[record.motivo] || record.motivo;
        }
        return '-';
    };
    
    const getStudentObservacion = (studentId) => {
        const record = getStudentRecord(studentId);
        if (record && record.observacion && record.observacion !== '') {
            return record.observacion;
        }
        return '-';
    };

    const openEditModal = (student) => {
        const record = getStudentRecord(student._id);
        setCurrentStudent(student);
        setEditData({
            estado: record?.estado || 'sin-registrar',
            motivo: record?.motivo || '',
            observacion: record?.observacion || ''
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!currentStudent) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: currentStudent._id,
                    fecha: selectedDate,
                    estado: editData.estado,
                    motivo: editData.estado !== 'presente' && editData.estado !== 'sin-registrar' ? editData.motivo : '',
                    observacion: editData.observacion || '',
                    registradoPor: 'admin'
                })
            });
            
            if (response.ok) {
                await fetchAttendance();
                setShowEditModal(false);
                alert('✅ Asistencia actualizada correctamente');
            } else {
                const error = await response.json();
                alert(`❌ Error: ${error.message || 'No se pudo actualizar'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión');
        }
    };
    
    const getGradeDisplay = (student) => student.grado_especifico || student.grado || 'N/A';
    const handleGradeChange = (e) => { setSelectedGrade(e.target.value); setSelectedSpecificGrade('todos'); };

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getEstadoColor = (estado) => {
        switch(estado) {
            case 'presente': return '#27ae60';
            case 'ausente': return '#e74c3c';
            case 'tarde': return '#f39c12';
            default: return '#95a5a6';
        }
    };

    const getEstadoTexto = (estado) => {
        switch(estado) {
            case 'presente': return 'Presente';
            case 'ausente': return 'Ausente';
            case 'tarde': return 'Tardanza';
            default: return 'Sin registrar';
        }
    };

    // Contar cuántos estudiantes tienen registro en la fecha actual (para mostrar el mensaje)
    const registeredCount = filteredStudents.filter(student => {
        const record = attendanceMap.get(student._id.toString());
        return record !== undefined;
    }).length;

    return (
        <div>
            <h2 style={styles.title}>Control de Inasistencias</h2>
            
            {/* Indicador de datos disponibles */}
            {registeredCount === 0 && !loading && (
                <div style={{...styles.infoBox, backgroundColor: '#fff3cd', color: '#856404'}}>
                    ⚠️ No hay registros de asistencia para la fecha {selectedDate} en los grados seleccionados.
                </div>
            )}
            
            {registeredCount > 0 && !loading && (
                <div style={{...styles.infoBox, backgroundColor: '#d4edda', color: '#155724'}}>
                    ✅ Mostrando {registeredCount} registros de asistencia para la fecha {selectedDate}
                </div>
            )}
            
            <div style={styles.filters}>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Fecha:</label>
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={styles.dateInput} />
                </div>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Grado General:</label>
                    <select value={selectedGrade} onChange={handleGradeChange} style={styles.gradeSelect}>
                        <option value="todos">Todos los grados</option>
                        <option value="preescolar">Preescolar</option>
                        <option value="primaria">Primaria</option>
                        <option value="secundaria">Secundaria</option>
                    </select>
                </div>
                {specificOptions.length > 0 && (
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Grado Específico:</label>
                        <select value={selectedSpecificGrade} onChange={(e) => setSelectedSpecificGrade(e.target.value)} style={styles.gradeSelect}>
                            <option value="todos">Todos los grados</option>
                            {specificOptions.map(grade => <option key={grade} value={grade}>{grade}</option>)}
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
            </div>
            
            {loading ? <p>Cargando...</p> : <>
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
                            {paginatedStudents.length > 0 ? paginatedStudents.map((student, idx) => {
                                const estado = getStudentAttendance(student._id);
                                const motivo = getStudentMotivo(student._id);
                                const observacion = getStudentObservacion(student._id);
                                return (
                                    <tr key={student._id} style={styles.tr}>
                                        <td style={styles.td}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                        <td style={styles.td}><strong>{student.apellido1 || student.apellido || 'N/A'}</strong></td>
                                        <td style={styles.td}>
                                            <span style={{...styles.gradeBadge, backgroundColor: student.grado_especifico === '0°' ? '#27ae60' : ['1°','2°','3°','4°','5°'].includes(student.grado_especifico) ? '#2980b9' : '#8e44ad'}}>
                                                {getGradeDisplay(student)}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{...styles.statusBadge, backgroundColor: getEstadoColor(estado), color: 'white'}}>
                                                {getEstadoTexto(estado)}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{motivo}</td>
                                        <td style={styles.td}>{observacion}</td>
                                        <td style={styles.td}>
                                            <button 
                                                style={styles.editButton}
                                                onClick={() => openEditModal(student)}
                                                title="Editar asistencia"
                                            >
                                                ✏️ Editar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="7" style={styles.emptyMessage}>No hay estudiantes con los filtros seleccionados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div style={styles.pagination}>
                        <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage === 1} style={styles.pageButton}>◀ Anterior</button>
                        <span style={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(p+1, totalPages))} disabled={currentPage === totalPages} style={styles.pageButton}>Siguiente ▶</button>
                    </div>
                )}
            </>}
            
            {/* Modal de Edición */}
            {showEditModal && currentStudent && (
                <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Editar Asistencia</h3>
                            <button style={styles.modalClose} onClick={() => setShowEditModal(false)}>×</button>
                        </div>
                        <div style={styles.modalContent}>
                            <p><strong>Estudiante:</strong> {currentStudent.apellido1 || currentStudent.apellido}</p>
                            <p><strong>Fecha:</strong> {selectedDate}</p>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.modalLabel}>Estado *</label>
                                <select 
                                    value={editData.estado} 
                                    onChange={(e) => setEditData({...editData, estado: e.target.value})}
                                    style={styles.select}
                                >
                                    <option value="sin-registrar">Sin registrar</option>
                                    <option value="presente">Presente</option>
                                    <option value="ausente">Ausente</option>
                                    <option value="tarde">Tardanza</option>
                                </select>
                            </div>
                            
                            {editData.estado !== 'presente' && editData.estado !== 'sin-registrar' && (
                                <div style={styles.formGroup}>
                                    <label style={styles.modalLabel}>Motivo</label>
                                    <select 
                                        value={editData.motivo} 
                                        onChange={(e) => setEditData({...editData, motivo: e.target.value})}
                                        style={styles.select}
                                    >
                                        <option value="">Seleccione un motivo</option>
                                        <option value="enfermedad">Enfermedad</option>
                                        <option value="permiso">Permiso</option>
                                        <option value="sin_justificar">Sin justificar</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                            )}
                            
                            <div style={styles.formGroup}>
                                <label style={styles.modalLabel}>Observaciones (opcional)</label>
                                <textarea 
                                    value={editData.observacion} 
                                    onChange={(e) => setEditData({...editData, observacion: e.target.value})}
                                    style={styles.textarea}
                                    rows="3"
                                    placeholder="Ingrese observaciones adicionales..."
                                />
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <button style={styles.cancelButton} onClick={() => setShowEditModal(false)}>Cancelar</button>
                            <button style={styles.saveButton} onClick={handleSaveEdit}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    title: { color: '#2c3e50', marginBottom: '30px', fontSize: '22px', fontWeight: '600' },
    infoBox: { padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' },
    filters: { display: 'flex', gap: '20px', marginBottom: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', flexWrap: 'wrap' },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '150px' },
    filterLabel: { fontWeight: 'bold', color: '#2c3e50', fontSize: '13px' },
    dateInput: { padding: '8px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '14px' },
    gradeSelect: { padding: '8px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '14px', minWidth: '150px', backgroundColor: 'white' },
    statsContainer: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' },
    statBox: { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' },
    statValue: { display: 'block', fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' },
    statLabel: { display: 'block', marginTop: '5px', color: '#7f8c8d', fontSize: '14px' },
    tableContainer: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #27ae60' },
    th: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontSize: '14px', fontWeight: 'bold' },
    tr: { borderBottom: '1px solid #ecf0f1' },
    td: { padding: '12px 15px', fontSize: '14px' },
    gradeBadge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' },
    statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' },
    editButton: { padding: '6px 12px', border: 'none', borderRadius: '4px', backgroundColor: '#3498db', color: 'white', cursor: 'pointer', fontSize: '12px' },
    emptyMessage: { textAlign: 'center', padding: '40px', color: '#95a5a6' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px', padding: '15px' },
    pageButton: { padding: '8px 16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
    pageInfo: { color: '#2c3e50', fontSize: '14px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #ecf0f1', backgroundColor: '#f8f9fa' },
    modalTitle: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#2c3e50' },
    modalClose: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#7f8c8d' },
    modalContent: { padding: '20px', overflowY: 'auto' },
    modalFooter: { padding: '16px 20px', borderTop: '1px solid #ecf0f1', textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' },
    formGroup: { marginBottom: '15px' },
    modalLabel: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50', fontSize: '13px' },
    select: { width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '14px', backgroundColor: 'white' },
    textarea: { width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' },
    cancelButton: { padding: '8px 16px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    saveButton: { padding: '8px 16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default AdminAttendanceControl;
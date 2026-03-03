// Frontend/src/Pages/AttendanceControl.jsx
import { useState, useEffect } from 'react';

const AttendanceControl = () => {
    const [attendance, setAttendance] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedGrade, setSelectedGrade] = useState('todos');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        present: 0,
        absent: 0,
        late: 0,
        total: 0
    });

    useEffect(() => {
        fetchStudents();
        fetchAttendance();
    }, [selectedDate, selectedGrade]);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = selectedGrade === 'todos' 
                ? 'http://localhost:5000/api/students'
                : `http://localhost:5000/api/students/grade/${selectedGrade}`;
            
            const response = await fetch(url, {
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
            if (data.success) {
                setAttendance(data.attendance);
                calculateStats(data.attendance);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (attendanceData) => {
        const stats = {
            present: attendanceData.filter(a => a.estado === 'presente').length,
            absent: attendanceData.filter(a => a.estado === 'ausente').length,
            late: attendanceData.filter(a => a.estado === 'tarde').length,
            total: attendanceData.length
        };
        setStats(stats);
    };

    const handleAttendanceChange = async (studentId, estado) => {
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
                    registradoPor: 'admin'
                })
            });
            const data = await response.json();
            if (data.success) {
                fetchAttendance();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getStudentAttendance = (studentId) => {
        return attendance.find(a => a.studentId === studentId)?.estado || 'sin-registrar';
    };

    return (
        <div>
            <h2 style={styles.title}>Control de Asistencia</h2>

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
                    <label style={styles.filterLabel}>Grado:</label>
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
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => {
                                const estado = getStudentAttendance(student._id);
                                return (
                                    <tr key={student._id} style={styles.tr}>
                                        <td style={styles.td}>{index + 1}</td>
                                        <td style={styles.td}>{student.apellido}</td>
                                        <td style={styles.td}>{student.grado}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: estado === 'presente' ? '#27ae60' :
                                                                estado === 'ausente' ? '#e74c3c' :
                                                                estado === 'tarde' ? '#f39c12' : '#95a5a6',
                                                color: 'white'
                                            }}>
                                                {estado === 'sin-registrar' ? 'Sin registrar' : estado}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button 
                                                style={{...styles.actionButton, backgroundColor: '#27ae60'}}
                                                onClick={() => handleAttendanceChange(student._id, 'presente')}
                                            >
                                                ✅ Presente
                                            </button>
                                            <button 
                                                style={{...styles.actionButton, backgroundColor: '#e74c3c'}}
                                                onClick={() => handleAttendanceChange(student._id, 'ausente')}
                                            >
                                                ❌ Ausente
                                            </button>
                                            <button 
                                                style={{...styles.actionButton, backgroundColor: '#f39c12'}}
                                                onClick={() => handleAttendanceChange(student._id, 'tarde')}
                                            >
                                                ⏰ Tarde
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    filterLabel: {
        fontWeight: 'bold',
        color: '#2c3e50'
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
        minWidth: '150px'
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
        fontSize: '14px'
    },
    tr: {
        borderBottom: '1px solid #ecf0f1'
    },
    td: {
        padding: '12px 15px',
        fontSize: '14px'
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
        padding: '5px 10px',
        border: 'none',
        borderRadius: '3px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'all 0.3s'
    }
};

export default AttendanceControl;
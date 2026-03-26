// Frontend/src/Pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import AdminSeguimiento from './AdminSeguimiento';
import AdminAttendanceControl from './AdminAttendanceControl';
import AdminReports from './AdminReports';
import AdminUserManagement from './AdminUserManagement';
import AdminMessaging from './AdminMessaging';
import AdminProfile from './AdminProfile';
import AdminSettings from './AdminSettings';

const AdminDashboard = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalParents: 0,
        todayInasistencia: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
        fetchRecentActivity();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            
            // 1. Obtener total de estudiantes
            const studentsRes = await fetch('http://localhost:5000/api/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const studentsData = await studentsRes.json();
            const totalEstudiantes = studentsData.success ? studentsData.data.length : 0;
            
            // 2. Obtener docentes y acudientes
            const usersRes = await fetch('http://localhost:5000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const usersData = await usersRes.json();
            const users = usersData.success ? usersData.users : [];
            const totalTeachers = users.filter(u => u.rol === 'docente').length;
            const totalParents = users.filter(u => u.rol === 'acudiente').length;
            
            // 3. Calcular inasistencias de los últimos 30 días
            const hoy = new Date();
            const hace30Dias = new Date();
            hace30Dias.setDate(hoy.getDate() - 30);
            
            const startDate = hace30Dias.toISOString().split('T')[0];
            const endDate = hoy.toISOString().split('T')[0];
            
            console.log(`📡 Buscando asistencias del ${startDate} al ${endDate}`);
            
            // Obtener todas las asistencias (sin filtro de fecha en la URL, luego filtramos)
            // Primero obtenemos todas las asistencias de los últimos 30 días con múltiples llamadas por fecha
            const estudiantesConInasistenciaSet = new Set();
            
            // Iterar día por día para obtener asistencias
            let currentDate = new Date(hace30Dias);
            let diasConDatos = 0;
            
            while (currentDate <= hoy) {
                const dateStr = currentDate.toISOString().split('T')[0];
                try {
                    const attendanceRes = await fetch(`http://localhost:5000/api/attendance?date=${dateStr}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const attendanceData = await attendanceRes.json();
                    
                    if (attendanceData.success && attendanceData.attendance) {
                        attendanceData.attendance.forEach(record => {
                            // Si es ausente o tarde, agregar el estudiante al Set
                            if (record.estado === 'ausente' || record.estado === 'tarde') {
                                const studentId = record.studentId?._id?.toString() || record.studentId?.toString();
                                if (studentId) {
                                    estudiantesConInasistenciaSet.add(studentId);
                                    diasConDatos++;
                                }
                            }
                        });
                    }
                } catch (err) {
                    console.error(`Error obteniendo asistencias para ${dateStr}:`, err);
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            const estudiantesConInasistencia = estudiantesConInasistenciaSet.size;
            const porcentajeInasistencia = totalEstudiantes > 0 
                ? Math.round((estudiantesConInasistencia / totalEstudiantes) * 100) 
                : 0;
            
            console.log(`📊 Total estudiantes: ${totalEstudiantes}`);
            console.log(`📊 Estudiantes con inasistencia en últimos 30 días: ${estudiantesConInasistencia}`);
            console.log(`📊 Porcentaje: ${porcentajeInasistencia}%`);
            console.log(`📊 Días con datos: ${diasConDatos}`);
            
            setStats({
                totalStudents: totalEstudiantes,
                totalTeachers: totalTeachers,
                totalParents: totalParents,
                todayInasistencia: porcentajeInasistencia
            });
            
        } catch (error) {
            console.error('❌ Error al cargar estadísticas:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchRecentActivity = async () => {
        try {
            const token = localStorage.getItem('token');
            const activities = [];
            
            // Últimas observaciones
            const obsRes = await fetch('http://localhost:5000/api/observations?limit=5', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const obsData = await obsRes.json();
            
            if (obsData.success && obsData.data) {
                obsData.data.forEach(obs => {
                    let nivelColor = '';
                    switch(obs.nivel) {
                        case 'Tipo I':
                            nivelColor = '#27ae60';
                            break;
                        case 'Tipo II':
                            nivelColor = '#f39c12';
                            break;
                        case 'Tipo III':
                            nivelColor = '#e74c3c';
                            break;
                        default:
                            nivelColor = '#95a5a6';
                    }
                    
                    activities.push({
                        id: obs._id,
                        type: 'observation',
                        title: 'Nueva observación',
                        description: `${obs.tipo} - ${obs.nivel}`,
                        student: obs.studentId?.apellido1 || 'Estudiante',
                        date: obs.createdAt,
                        nivelColor: nivelColor
                    });
                });
            }
            
            // Últimas asistencias
            const today = new Date().toISOString().split('T')[0];
            const attendanceRes = await fetch(`http://localhost:5000/api/attendance?date=${today}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const attendanceData = await attendanceRes.json();
            
            if (attendanceData.success && attendanceData.attendance) {
                attendanceData.attendance.slice(0, 3).forEach(a => {
                    let estadoColor = '';
                    let estadoTexto = '';
                    switch(a.estado) {
                        case 'presente':
                            estadoColor = '#27ae60';
                            estadoTexto = 'Presente';
                            break;
                        case 'ausente':
                            estadoColor = '#e74c3c';
                            estadoTexto = 'Ausente';
                            break;
                        case 'tarde':
                            estadoColor = '#f39c12';
                            estadoTexto = 'Tardanza';
                            break;
                        default:
                            estadoColor = '#95a5a6';
                            estadoTexto = 'Registro';
                    }
                    
                    activities.push({
                        id: a._id,
                        type: 'attendance',
                        title: 'Asistencia registrada',
                        description: estadoTexto,
                        student: a.studentId?.apellido1 || 'Estudiante',
                        date: a.createdAt,
                        estadoColor: estadoColor
                    });
                });
            }
            
            activities.sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecentActivity(activities.slice(0, 5));
            
        } catch (error) {
            console.error('Error al cargar actividad reciente:', error);
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const diffMins = Math.floor((new Date() - date) / 60000);
        if (diffMins < 60) return `Hace ${diffMins} minutos`;
        if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} horas`;
        return `Hace ${Math.floor(diffMins / 1440)} días`;
    };

    const renderContent = () => {
        switch(activeSection) {
            case 'seguimiento': return <AdminSeguimiento />;
            case 'attendance': return <AdminAttendanceControl />;
            case 'reports': return <AdminReports />;
            case 'users': return <AdminUserManagement />;
            case 'messages': return <AdminMessaging user={user} />;
            case 'profile': return <AdminProfile user={user} />;
            case 'settings': return <AdminSettings />;
            default: return (
                <div>
                    <div style={pageStyles.header}>
                        <h2 style={pageStyles.pageTitle}>Panel de Control</h2>
                        <button onClick={fetchStats} style={pageStyles.refreshButton}>Actualizar</button>
                    </div>
                    
                    {error && <div style={pageStyles.error}>Error: {error}</div>}
                    
                    <div style={pageStyles.statsGrid}>
                        <div style={pageStyles.statCard}>
                            <div style={pageStyles.statNumber}>{stats.totalStudents}</div>
                            <div style={pageStyles.statLabel}>Estudiantes</div>
                        </div>
                        <div style={pageStyles.statCard}>
                            <div style={pageStyles.statNumber}>{stats.totalTeachers}</div>
                            <div style={pageStyles.statLabel}>Docentes</div>
                        </div>
                        <div style={pageStyles.statCard}>
                            <div style={pageStyles.statNumber}>{stats.totalParents}</div>
                            <div style={pageStyles.statLabel}>Acudientes</div>
                        </div>
                        <div style={pageStyles.statCard}>
                            <div style={pageStyles.statNumber}>{stats.todayInasistencia}%</div>
                            <div style={pageStyles.statLabel}>Inasistencia (30 días)</div>
                        </div>
                    </div>
                    
                    <div style={pageStyles.recentActivity}>
                        <h3>Actividad Reciente</h3>
                        <div style={pageStyles.activityList}>
                            {loading ? (
                                <p style={pageStyles.placeholder}>Cargando actividades...</p>
                            ) : recentActivity.length === 0 ? (
                                <p style={pageStyles.placeholder}>No hay actividad reciente</p>
                            ) : (
                                recentActivity.map(activity => (
                                    <div key={activity.id} style={pageStyles.activityItem}>
                                        <div style={pageStyles.activityIcon}>
                                            {activity.type === 'observation' ? '📝' : '📅'}
                                        </div>
                                        <div style={pageStyles.activityContent}>
                                            <div style={pageStyles.activityHeader}>
                                                <strong style={pageStyles.activityTitle}>{activity.title}</strong>
                                                <span style={pageStyles.activityDate}>{formatDate(activity.date)}</span>
                                            </div>
                                            <div style={pageStyles.activityDescription}>
                                                <span 
                                                    style={{
                                                        ...pageStyles.badge,
                                                        backgroundColor: activity.nivelColor || activity.estadoColor
                                                    }}
                                                >
                                                    {activity.description}
                                                </span>
                                                <span style={pageStyles.activityStudent}>para {activity.student}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <AdminLayout user={user} onLogout={onLogout} activeSection={activeSection} setActiveSection={setActiveSection}>
            {renderContent()}
        </AdminLayout>
    );
};

const pageStyles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    pageTitle: {
        margin: 0,
        color: '#2c3e50',
        fontSize: '24px',
        fontWeight: '600'
    },
    refreshButton: {
        padding: '8px 16px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    error: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #feb2b2'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '40px'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        textAlign: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        ':hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }
    },
    statNumber: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '8px'
    },
    statLabel: {
        fontSize: '14px',
        color: '#7f8c8d'
    },
    recentActivity: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    activityList: {
        marginTop: '15px'
    },
    activityItem: {
        display: 'flex',
        gap: '16px',
        padding: '16px 0',
        borderBottom: '1px solid #ecf0f1'
    },
    activityIcon: {
        fontSize: '28px',
        width: '40px',
        textAlign: 'center'
    },
    activityContent: {
        flex: 1
    },
    activityHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        flexWrap: 'wrap',
        gap: '8px'
    },
    activityTitle: {
        fontSize: '15px',
        color: '#2c3e50'
    },
    activityDate: {
        fontSize: '12px',
        color: '#95a5a6'
    },
    activityDescription: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
    },
    badge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '500'
    },
    activityStudent: {
        fontSize: '13px',
        color: '#7f8c8d'
    },
    placeholder: {
        textAlign: 'center',
        color: '#95a5a6',
        padding: '40px'
    }
};

export default AdminDashboard;
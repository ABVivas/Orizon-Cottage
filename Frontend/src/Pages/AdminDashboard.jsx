// Frontend/src/Pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import StudentManagement from './StudentManagement';
import TeacherManagement from './TeacherManagement';
import AttendanceControl from './AttendanceControl';
import DisciplineReports from './DisciplineReports';
import InstitutionalMessaging from './InstitutionalMessaging';
import AdminProfile from './AdminProfile';
import SystemSettings from './SystemSettings';
import SeguimientoGeneral from './SeguimientoGeneral';


const AdminDashboard = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [stats, setStats] = useState({
        totalStudents: 168,
        totalTeachers: 14,
        totalParents: 154,
        todayAttendance: 85,
        pendingObservations: 12,
        unreadMessages: 0
    });

    useEffect(() => {
        // Aquí puedes fetch las estadísticas reales
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const renderContent = () => {
        switch(activeSection) {
            case 'users':
                return <UserManagement />;
            case 'students':
                return <StudentManagement />;
            case 'teachers':
                return <TeacherManagement />;
            case 'attendance':
                return <AttendanceControl />;
            case 'reports':
                return <DisciplineReports />;
            case 'profile':
                return <AdminProfile user={user} />;
            case 'settings':
                return <SystemSettings />;
            case 'messages':
                return <InstitutionalMessaging user={user} />;
            case 'seguimiento':
                return <SeguimientoGeneral />;
            default:
                return <Overview stats={stats} onRefresh={fetchStats} />;
        }
    };

    return (
        <div style={styles.container}>
            {/* Sidebar - Menú lateral */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <h2 style={styles.sidebarTitle}>Orizon Cottage</h2>
                    <p style={styles.userInfo}>{user?.nombre}</p>
                    <p style={styles.userRole}>Administrador</p>
                </div>

                <nav style={styles.sidebarNav}>
                    <div style={styles.navSection}>
                        <div style={styles.navSectionTitle}>📊 PANEL PRINCIPAL</div>
                        <button 
                            style={{...styles.navItem, ...(activeSection === 'seguimiento' && styles.navItemActive)}}
                            onClick={() => setActiveSection('seguimiento')}
                        >
                            📈 Seguimiento General
                        </button>
                        <button 
                            style={{...styles.navItem, ...(activeSection === 'attendance' && styles.navItemActive)}}
                            onClick={() => setActiveSection('attendance')}
                        >
                            📋 Control de Asistencia
                        </button>
                        <button 
                            style={{...styles.navItem, ...(activeSection === 'reports' && styles.navItemActive)}}
                            onClick={() => setActiveSection('reports')}
                        >
                            📊 Reportes
                        </button>
                        <button 
                            style={{...styles.navItem, ...(activeSection === 'messages' && styles.navItemActive)}}
                            onClick={() => setActiveSection('messages')}
                        >
                            💬 Mensajería
                        </button>
                    </div>

                    {/* GESTIÓN DE USUARIOS */}
                    <div style={styles.navSection}>
                        <div style={styles.navSectionTitle}>👥 GESTIÓN DE USUARIOS</div>
                        <button 
                            style={{...styles.navItem, ...(activeSection === 'users' && styles.navItemActive)}}
                            onClick={() => setActiveSection('users')}
                        >
                            👥 Todos los Usuarios
                        </button>
                    </div>

                    {/* CONFIGURACIÓN */}
                    <div style={styles.navSection}>
                        <div style={styles.navSectionTitle}>⚙️ CONFIGURACIÓN</div>
                        <button 
                            style={{...styles.navItem, ...(activeSection === 'profile' && styles.navItemActive)}}
                            onClick={() => setActiveSection('profile')}
                        >
                            👤 Mi Perfil
                        </button>
                        <button 
                            style={{...styles.navItem, ...(activeSection === 'settings' && styles.navItemActive)}}
                            onClick={() => setActiveSection('settings')}
                        >
                            ⚙️ Configuración del Sistema
                        </button>
                    </div>
                </nav>
                <div style={styles.sidebarFooter}>
                    <button style={styles.logoutButton} onClick={onLogout}>
                        🔓 Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Main Content - Contenido principal */}
            <div style={styles.mainContent}>
                {renderContent()}
            </div>
        </div>
    );
};

// Componente Overview (Resumen)
const Overview = ({ stats, onRefresh }) => (
    <div>
        <div style={styles.header}>
            <h2 style={styles.pageTitle}>Panel de Control</h2>
            <button onClick={onRefresh} style={styles.refreshButton}>
                🔄 Actualizar
            </button>
        </div>
        
        <div style={styles.statsGrid}>
            <div style={styles.statCard}>
                <div style={styles.statIcon}>🧑‍🎓</div>
                <div>
                    <h3 style={styles.statNumber}>{stats.totalStudents}</h3>
                    <p style={styles.statLabel}>Estudiantes</p>
                </div>
            </div>
            
            <div style={styles.statCard}>
                <div style={styles.statIcon}>👨‍🏫</div>
                <div>
                    <h3 style={styles.statNumber}>{stats.totalTeachers}</h3>
                    <p style={styles.statLabel}>Docentes</p>
                </div>
            </div>
            
            <div style={styles.statCard}>
                <div style={styles.statIcon}>👪</div>
                <div>
                    <h3 style={styles.statNumber}>{stats.totalParents}</h3>
                    <p style={styles.statLabel}>Acudientes</p>
                </div>
            </div>
            
            <div style={styles.statCard}>
                <div style={styles.statIcon}>📋</div>
                <div>
                    <h3 style={styles.statNumber}>{stats.todayAttendance}%</h3>
                    <p style={styles.statLabel}>Asistencia Hoy</p>
                </div>
            </div>
            
            <div style={styles.statCard}>
                <div style={styles.statIcon}>⚠️</div>
                <div>
                    <h3 style={styles.statNumber}>{stats.pendingObservations}</h3>
                    <p style={styles.statLabel}>Observaciones Pendientes</p>
                </div>
            </div>
            
            <div style={styles.statCard}>
                <div style={styles.statIcon}>💬</div>
                <div>
                    <h3 style={styles.statNumber}>{stats.unreadMessages}</h3>
                    <p style={styles.statLabel}>Mensajes No Leídos</p>
                </div>
            </div>
        </div>

        <div style={styles.recentActivity}>
            <h3>Actividad Reciente</h3>
            <div style={styles.activityList}>
                <p style={styles.placeholder}>Cargando actividades...</p>
            </div>
        </div>
    </div>
);

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
    },
    sidebar: {
        width: '280px',
        backgroundColor: '#2c3e50',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        overflowY: 'auto'
    },
    sidebarHeader: {
        padding: '30px 20px',
        textAlign: 'center',
        borderBottom: '1px solid #34495e'
    },
    sidebarTitle: {
        margin: '0 0 10px 0',
        color: '#27ae60',
        fontSize: '20px'
    },
    userInfo: {
        margin: '5px 0',
        fontSize: '16px',
        fontWeight: 'bold'
    },
    userRole: {
        margin: 0,
        fontSize: '14px',
        color: '#27ae60',
        opacity: 0.8
    },
    sidebarNav: {
        flex: 1,
        padding: '20px 0'
    },
    navItem: {
        display: 'block',
        width: '100%',
        padding: '12px 25px',
        border: 'none',
        background: 'none',
        color: '#ecf0f1',
        textAlign: 'left',
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        borderLeft: '3px solid transparent'
    },
    navItemActive: {
        backgroundColor: '#34495e',
        borderLeftColor: '#27ae60',
        color: '#27ae60'
    },
    navSection: {
        marginBottom: '20px'
    },
    navSectionTitle: {
        padding: '10px 20px',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#7f8c8d',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    sidebarFooter: {
        padding: '20px',
        borderTop: '1px solid #34495e'
    },
    logoutButton: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s'
    },
    mainContent: {
        flex: 1,
        marginLeft: '280px',
        padding: '30px',
        backgroundColor: '#f5f5f5'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    pageTitle: {
        margin: 0,
        color: '#2c3e50',
        fontSize: '24px'
    },
    refreshButton: {
        padding: '8px 15px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        transition: 'transform 0.3s',
        cursor: 'pointer'
    },
    statIcon: {
        fontSize: '40px'
    },
    statNumber: {
        margin: '0 0 5px 0',
        fontSize: '24px',
        color: '#2c3e50'
    },
    statLabel: {
        margin: 0,
        color: '#7f8c8d',
        fontSize: '14px'
    },
    recentActivity: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    placeholder: {
        textAlign: 'center',
        color: '#95a5a6',
        padding: '40px'
    }
};

export default AdminDashboard;
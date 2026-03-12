// Frontend/src/Pages/DocenteDashboard.jsx
import { useState, useEffect } from 'react';

const DocenteDashboard = ({ user }) => {
    const [stats, setStats] = useState({
        totalEstudiantes: 0,
        asistenciaPromedio: 0
    });
    const [inasistenciasRecientes, setInasistenciasRecientes] = useState([]);
    const [observacionesRecientes, setObservacionesRecientes] = useState([]);
    const [gradosDocente, setGradosDocente] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const docenteId = user?.id;

            if (!docenteId) {
                setError('No se encontró ID del docente');
                setLoading(false);
                return;
            }

            console.log('🔍 Cargando datos para docente:', docenteId);
            console.log('👤 Usuario:', user);

            // 1. Obtener estudiantes del docente (YA FILTRADO POR GRADOS)
            const studentsRes = await fetch(`http://localhost:5000/api/students/docente/${docenteId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!studentsRes.ok) throw new Error('Error al cargar estudiantes');
            const studentsData = await studentsRes.json();
            console.log('📚 Estudiantes del docente:', studentsData);
            
            // Guardar los grados que enseña este docente
            setGradosDocente(studentsData.grados || []);
            
            // 2. Obtener inasistencias de los estudiantes del docente
            const attendanceRes = await fetch(`http://localhost:5000/api/attendance/docente/${docenteId}?limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            let attendanceData = { data: [] };
            if (attendanceRes.ok) {
                attendanceData = await attendanceRes.json();
            }
            console.log('📊 Inasistencias:', attendanceData);
            
            // 3. Obtener observaciones del docente
            const obsRes = await fetch(`http://localhost:5000/api/observations/docente/${docenteId}?limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            let obsData = { data: [] };
            if (obsRes.ok) {
                obsData = await obsRes.json();
            }
            console.log('📝 Observaciones:', obsData);

            // 4. Calcular estadísticas
            const totalEstudiantes = studentsData.count || 0;
            
            // Calcular asistencia promedio (simulado por ahora)
            const asistenciaPromedio = 95;

            setStats({
                totalEstudiantes,
                asistenciaPromedio
            });

            // Formatear inasistencias para mostrar
            const inasistenciasFormateadas = (attendanceData.data || []).map(item => ({
                estudiante: item.estudiante?.nombre || item.estudiante?.apellido1 || 'Estudiante',
                curso: item.estudiante?.grado_especifico || '',
                fecha: item.fecha,
                justificada: !!item.motivo
            }));

            // Formatear observaciones para mostrar
            const observacionesFormateadas = (obsData.data || []).map(item => ({
                estudiante: item.estudiante?.apellido1 || item.estudiante?.apellido || 'Estudiante',
                tipo: item.tipo || 'General',
                fecha: item.fecha,
                nivel: item.nivel || 'N/A'
            }));

            setInasistenciasRecientes(inasistenciasFormateadas);
            setObservacionesRecientes(observacionesFormateadas);

        } catch (error) {
            console.error('❌ Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Cargando panel del docente...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <p style={styles.errorText}>Error: {error}</p>
                <button onClick={fetchData} style={styles.retryButton}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header de bienvenida */}
            <div style={styles.welcomeSection}>
                <h2 style={styles.welcomeTitle}>
                    ¡Hola, {user?.nombre?.split(' ')[0] || 'Docente'}! 🎉
                </h2>
                <p style={styles.welcomeText}>
                    Bienvenido de vuelta a tu panel de control
                </p>
                {gradosDocente.length > 0 && (
                    <p style={styles.gradosInfo}>
                        Grados a cargo: {gradosDocente.join(', ')}
                    </p>
                )}
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{stats.totalEstudiantes}</span>
                    <span style={styles.statLabel}>Estudiantes</span>
                    {stats.totalEstudiantes > 0 && (
                        <span style={styles.statTrend}>+{Math.floor(stats.totalEstudiantes * 0.1)} este mes</span>
                    )}
                </div>

                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{stats.asistenciaPromedio}%</span>
                    <span style={styles.statLabel}>Asistencia</span>
                    <span style={{...styles.statTrend, color: '#27ae60'}}>↑ 5% que ayer</span>
                </div>
            </div>

            {/* Inasistencias Recientes */}
            <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                    <h3 style={styles.sectionTitle}>
                        <span style={styles.sectionIcon}>📋</span>
                        Inasistencias Recientes
                    </h3>
                    <button style={styles.viewAllButton}>Ver todas →</button>
                </div>
                
                {inasistenciasRecientes.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={styles.emptyIcon}>✅</span>
                        <p style={styles.emptyText}>No hay inasistencias recientes</p>
                        <p style={styles.emptySubtext}>Todos los estudiantes han asistido hoy</p>
                    </div>
                ) : (
                    <div style={styles.listContainer}>
                        {inasistenciasRecientes.map((item, index) => (
                            <div key={index} style={styles.listItem}>
                                <div style={styles.itemHeader}>
                                    <strong>{item.estudiante}</strong>
                                    <span style={styles.itemCurso}>{item.curso}</span>
                                </div>
                                <div style={styles.itemDetails}>
                                    <span style={styles.itemDate}>
                                        {formatDate(item.fecha)}
                                    </span>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: item.justificada ? '#27ae60' : '#e74c3c'
                                    }}>
                                        {item.justificada ? 'Justificada' : 'Sin justificar'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Observaciones Recientes */}
            <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                    <h3 style={styles.sectionTitle}>
                        <span style={styles.sectionIcon}>📝</span>
                        Observaciones Recientes
                    </h3>
                    <button style={styles.viewAllButton}>Ver todas →</button>
                </div>
                
                {observacionesRecientes.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={styles.emptyIcon}>📭</span>
                        <p style={styles.emptyText}>No hay observaciones recientes</p>
                        <p style={styles.emptySubtext}>Las nuevas observaciones aparecerán aquí</p>
                    </div>
                ) : (
                    <div style={styles.listContainer}>
                        {observacionesRecientes.map((item, index) => (
                            <div key={index} style={styles.listItem}>
                                <div style={styles.itemHeader}>
                                    <strong>{item.estudiante}</strong>
                                    <span style={{
                                        ...styles.tipoBadge,
                                        backgroundColor: item.tipo === 'Disciplinaria' ? '#e74c3c' : '#3498db'
                                    }}>
                                        {item.tipo}
                                    </span>
                                </div>
                                <div style={styles.itemDetails}>
                                    <span style={styles.itemDate}>
                                        {formatDate(item.fecha)}
                                    </span>
                                    <span style={{
                                        ...styles.nivelBadge,
                                        backgroundColor: 
                                            item.nivel === 'Leve' ? '#27ae60' :
                                            item.nivel === 'Medio' ? '#f39c12' :
                                            item.nivel === 'Grave' ? '#e74c3c' : '#95a5a6'
                                    }}>
                                        {item.nivel}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '16px',
        width: '100%',
        boxSizing: 'border-box'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
        width: '100%'
    },
    loadingSpinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #27ae60',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '15px'
    },
    loadingText: {
        color: '#2c3e50',
        fontSize: '14px'
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
        gap: '15px'
    },
    errorText: {
        color: '#e74c3c',
        fontSize: '14px'
    },
    retryButton: {
        padding: '8px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    welcomeSection: {
        marginBottom: '20px'
    },
    welcomeTitle: {
        margin: '0 0 4px 0',
        fontSize: '22px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    welcomeText: {
        margin: '0 0 8px 0',
        fontSize: '14px',
        color: '#7f8c8d'
    },
    gradosInfo: {
        margin: 0,
        fontSize: '13px',
        color: '#27ae60',
        fontWeight: '500'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        position: 'relative'
    },
    statNumber: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        lineHeight: 1.2
    },
    statLabel: {
        color: '#7f8c8d',
        fontSize: '13px'
    },
    statTrend: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        fontSize: '11px',
        color: '#e74c3c',
        backgroundColor: '#fdeded',
        padding: '2px 8px',
        borderRadius: '12px'
    },
    sectionCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '16px',
        overflow: 'hidden'
    },
    sectionHeader: {
        padding: '14px 16px',
        borderBottom: '1px solid #ecf0f1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sectionTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '500',
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    sectionIcon: {
        fontSize: '18px'
    },
    viewAllButton: {
        background: 'none',
        border: 'none',
        color: '#27ae60',
        fontSize: '13px',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '4px',
        ':hover': {
            backgroundColor: '#e8f5e9'
        }
    },
    emptyState: {
        padding: '24px 16px',
        textAlign: 'center'
    },
    emptyIcon: {
        fontSize: '36px',
        opacity: 0.5,
        marginBottom: '8px',
        display: 'block'
    },
    emptyText: {
        color: '#2c3e50',
        fontSize: '15px',
        fontWeight: '500',
        margin: '0 0 4px 0'
    },
    emptySubtext: {
        color: '#95a5a6',
        fontSize: '13px',
        margin: 0
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px'
    },
    listItem: {
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '3px solid #27ae60'
    },
    itemHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px'
    },
    itemCurso: {
        color: '#7f8c8d',
        fontSize: '12px',
        backgroundColor: '#ecf0f1',
        padding: '2px 8px',
        borderRadius: '12px'
    },
    itemDetails: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    itemDate: {
        color: '#7f8c8d',
        fontSize: '12px'
    },
    badge: {
        padding: '2px 8px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '11px',
        fontWeight: 'bold'
    },
    tipoBadge: {
        padding: '2px 8px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '11px',
        fontWeight: 'bold',
        marginLeft: '8px'
    },
    nivelBadge: {
        padding: '2px 8px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '11px',
        fontWeight: 'bold'
    }
};

// Animación global
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default DocenteDashboard;
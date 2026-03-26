// Frontend/src/Pages/DirectivoDashboard.jsx
import { useState, useEffect } from 'react';

const DirectivoDashboard = ({ user }) => {
    const [stats, setStats] = useState({
        totalEstudiantes: 0,
        totalDocentes: 0,
        inasistenciasHoy: 0,
        observacionesPendientes: 0,
        mensajesNuevos: 0
    });
    const [observacionesPorNivel, setObservacionesPorNivel] = useState([]);
    const [estudiantesSeguimiento, setEstudiantesSeguimiento] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // 1. Total estudiantes
            const estudiantesRes = await fetch('http://localhost:5000/api/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const estudiantesData = await estudiantesRes.json();
            const totalEstudiantes = estudiantesData.success ? estudiantesData.data.length : 0;
            
            // 2. Total docentes únicos
            const teachersRes = await fetch('http://localhost:5000/api/teachers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const teachersData = await teachersRes.json();
            const docentesUnicos = teachersData.success ? new Set(teachersData.data.map(t => t.docente)).size : 0;
            
            // 3. Inasistencias de hoy (ausentes + tardanzas)
            const hoy = new Date().toLocaleDateString('en-CA');
            const attendanceRes = await fetch(`http://localhost:5000/api/attendance?date=${hoy}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const attendanceData = await attendanceRes.json();
            const inasistenciasHoy = attendanceData.success ? 
                attendanceData.attendance.filter(a => a.estado === 'ausente' || a.estado === 'tarde').length : 0;
            
            // 4. Observaciones pendientes (con seguimiento activo)
            const observationsRes = await fetch('http://localhost:5000/api/observations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const observationsData = await observationsRes.json();
            const observacionesPendientes = observationsData.success ? 
                observationsData.data.filter(o => o.requiereSeguimiento === true).length : 0;
            
            // 5. Mensajes nuevos (no leídos para el usuario actual)
            const messagesRes = await fetch(`http://localhost:5000/api/messages/received/${user?.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const messagesData = await messagesRes.json();
            const mensajesNuevos = Array.isArray(messagesData) ? messagesData.filter(m => !m.leido).length : 0;
            
            setStats({
                totalEstudiantes,
                totalDocentes: docentesUnicos,
                inasistenciasHoy,
                observacionesPendientes,
                mensajesNuevos
            });
            
            // 6. Observaciones por nivel
            const observacionesNivel = await fetch('http://localhost:5000/api/observations/summary', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const nivelData = await observacionesNivel.json();
            
            if (nivelData.success && nivelData.data) {
                const niveles = [];
                const totalObs = nivelData.data.total || 0;
                if (nivelData.data.porNivel) {
                    Object.entries(nivelData.data.porNivel).forEach(([nivel, cantidad]) => {
                        if (cantidad > 0) {
                            niveles.push({
                                nivel: nivel,
                                cantidad: cantidad,
                                porcentaje: totalObs > 0 ? Math.round((cantidad / totalObs) * 100) : 0
                            });
                        }
                    });
                }
                const orden = { 'Tipo I': 1, 'Tipo II': 2, 'Tipo III': 3 };
                niveles.sort((a, b) => orden[a.nivel] - orden[b.nivel]);
                setObservacionesPorNivel(niveles);
            }
            
            // 7. Estudiantes en seguimiento
            const seguimientoRes = await fetch('http://localhost:5000/api/seguimiento', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const seguimientoData = await seguimientoRes.json();
            
            if (seguimientoData.success && seguimientoData.data) {
                const top5 = seguimientoData.data.slice(0, 5).map(item => ({
                    _id: item._id,
                    nombre: item.estudiante,
                    curso: item.curso,
                    observaciones: item.observaciones,
                    inasistencias: item.inasistencias || 0,
                    ultimaObs: item.ultimaObs,
                    descripcion: item.descripcion || 'Sin descripción',
                    nivel: item.nivel || 'No especificado',
                    docente: item.docente || 'Docente'
                }));
                setEstudiantesSeguimiento(top5);
            }
            
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (e) {
            return '';
        }
    };

    const getNivelColor = (nivel) => {
        if (nivel === 'Tipo I') return '#27ae60';
        if (nivel === 'Tipo II') return '#f39c12';
        if (nivel === 'Tipo III') return '#e74c3c';
        return '#95a5a6';
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p>Cargando panel directivo...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <p>{error}</p>
                <button onClick={fetchData} style={styles.retryButton}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Panel Directivo</h2>
            <p style={styles.pageSubtitle}>Vista general del sistema de convivencia</p>
            
            {/* Stats Grid */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{stats.totalEstudiantes}</span>
                    <span style={styles.statLabel}>Estudiantes</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{stats.totalDocentes}</span>
                    <span style={styles.statLabel}>Docentes</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{stats.inasistenciasHoy}</span>
                    <span style={styles.statLabel}>Inasistencias Hoy</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{stats.observacionesPendientes}</span>
                    <span style={styles.statLabel}>Obs. Pendientes</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{stats.mensajesNuevos}</span>
                    <span style={styles.statLabel}>Mensajes Nuevos</span>
                </div>
            </div>
            
            {/* Two Column Layout */}
            <div style={styles.twoColumnGrid}>
                {/* Columna izquierda: Observaciones por nivel */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Observaciones por Nivel</h3>
                    {observacionesPorNivel.length === 0 ? (
                        <p style={styles.emptyMessage}>No hay datos de observaciones</p>
                    ) : (
                        <div style={styles.nivelesList}>
                            {observacionesPorNivel.map((item, index) => (
                                <div key={index} style={styles.nivelItem}>
                                    <div style={styles.nivelHeader}>
                                        <span style={styles.nivelNombre}>{item.nivel}</span>
                                        <span style={styles.nivelCantidad}>
                                            {item.cantidad} ({item.porcentaje}%)
                                        </span>
                                    </div>
                                    <div style={styles.progressBar}>
                                        <div style={{
                                            ...styles.progressFill,
                                            width: `${item.porcentaje}%`,
                                            backgroundColor: getNivelColor(item.nivel)
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Columna derecha: Estudiantes en seguimiento */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Estudiantes en Seguimiento</h3>
                        <button 
                            onClick={() => {
                                const event = new CustomEvent('changeSection', { detail: { section: 'seguimiento' } });
                                window.dispatchEvent(event);
                            }}
                            style={styles.viewAllButton}
                        >
                            Ver todos →
                        </button>
                    </div>
                    {estudiantesSeguimiento.length === 0 ? (
                        <p style={styles.emptyMessage}>No hay estudiantes en seguimiento</p>
                    ) : (
                        <div style={styles.seguimientoList}>
                            {estudiantesSeguimiento.map((est, index) => (
                                <div key={est._id || index} style={styles.seguimientoItem}>
                                    <div style={styles.seguimientoHeader}>
                                        <div>
                                            <strong style={styles.seguimientoNombre}>{est.nombre}</strong>
                                            <span style={styles.seguimientoCurso}>{est.curso}</span>
                                        </div>
                                        <span style={{
                                            ...styles.seguimientoBadge,
                                            backgroundColor: getNivelColor(est.nivel)
                                        }}>
                                            {est.nivel}
                                        </span>
                                    </div>
                                    
                                    <div style={styles.seguimientoStats}>
                                        <span>{est.observaciones} observaciones</span>
                                        <span>{est.inasistencias} inasistencias</span>
                                        <span>{est.docente}</span>
                                    </div>
                                    
                                    <div style={styles.seguimientoDescripcion}>
                                        {est.descripcion}
                                    </div>
                                    
                                    <div style={styles.seguimientoFooter}>
                                        {formatDate(est.ultimaObs)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto'
    },
    pageTitle: {
        margin: '0 0 5px 0',
        fontSize: '28px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    pageSubtitle: {
        margin: '0 0 24px 0',
        fontSize: '14px',
        color: '#7f8c8d'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
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
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        gap: '15px'
    },
    retryButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        marginBottom: '30px'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        textAlign: 'center'
    },
    statNumber: {
        display: 'block',
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '8px'
    },
    statLabel: {
        fontSize: '13px',
        color: '#7f8c8d'
    },
    twoColumnGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '20px'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    cardTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '600',
        color: '#2c3e50',
        paddingBottom: '10px',
        borderBottom: '2px solid #27ae60'
    },
    viewAllButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#27ae60',
        fontSize: '13px',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '4px'
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#95a5a6',
        padding: '40px 0',
        fontSize: '14px'
    },
    nivelesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    nivelItem: {
        width: '100%'
    },
    nivelHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px'
    },
    nivelNombre: {
        fontWeight: '500',
        color: '#2c3e50',
        fontSize: '14px'
    },
    nivelCantidad: {
        color: '#7f8c8d',
        fontSize: '13px'
    },
    progressBar: {
        height: '8px',
        backgroundColor: '#ecf0f1',
        borderRadius: '4px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        borderRadius: '4px',
        transition: 'width 0.3s ease'
    },
    seguimientoList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '500px',
        overflowY: 'auto'
    },
    seguimientoItem: {
        padding: '14px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        borderLeft: `3px solid #27ae60`
    },
    seguimientoHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        flexWrap: 'wrap',
        gap: '8px'
    },
    seguimientoNombre: {
        fontSize: '15px',
        color: '#2c3e50',
        marginRight: '8px'
    },
    seguimientoCurso: {
        fontSize: '12px',
        color: '#7f8c8d',
        backgroundColor: '#ecf0f1',
        padding: '2px 8px',
        borderRadius: '12px',
        marginLeft: '8px'
    },
    seguimientoBadge: {
        fontSize: '11px',
        padding: '3px 10px',
        borderRadius: '20px',
        fontWeight: '600',
        color: 'white'
    },
    seguimientoStats: {
        display: 'flex',
        gap: '16px',
        marginBottom: '10px',
        fontSize: '12px',
        color: '#5a6e7c'
    },
    seguimientoDescripcion: {
        fontSize: '13px',
        color: '#2c3e50',
        marginBottom: '10px',
        padding: '8px 10px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        fontStyle: 'italic',
        borderLeft: '2px solid #27ae60'
    },
    seguimientoFooter: {
        fontSize: '11px',
        color: '#95a5a6',
        display: 'flex',
        justifyContent: 'flex-end'
    }
};

// Animación global para el spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default DirectivoDashboard;
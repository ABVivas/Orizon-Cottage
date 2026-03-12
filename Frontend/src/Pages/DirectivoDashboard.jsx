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
            
            const response = await fetch('http://localhost:5000/api/directivo/dashboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al cargar datos del dashboard');
            }
            
            const data = await response.json();
            console.log('📊 Datos directivo:', data);
            
            if (data.success) {
                setStats(data.data.stats);
                setObservacionesPorNivel(data.data.observacionesPorNivel);
                setEstudiantesSeguimiento(data.data.estudiantesSeguimiento);
            } else {
                throw new Error(data.message || 'Error al cargar datos');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Cargando panel directivo...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <p style={styles.errorText}>❌ {error}</p>
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

            {/* Observaciones por Nivel y Estudiantes en Seguimiento */}
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
                                        <span style={styles.nivelCantidad}>{item.cantidad} ({item.porcentaje}%)</span>
                                    </div>
                                    <div style={styles.progressBar}>
                                        <div style={{...styles.progressFill, width: `${item.porcentaje}%`}} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Columna derecha: Estudiantes en seguimiento */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Estudiantes en Seguimiento</h3>
                    {estudiantesSeguimiento.length === 0 ? (
                        <p style={styles.emptyMessage}>No hay estudiantes en seguimiento</p>
                    ) : (
                        <div style={styles.seguimientoList}>
                            {estudiantesSeguimiento.map((est, index) => (
                                <div key={index} style={styles.seguimientoItem}>
                                    <div style={styles.seguimientoHeader}>
                                        <strong>{est.nombre}</strong>
                                        <span style={styles.seguimientoCurso}>Curso: {est.curso}</span>
                                    </div>
                                    <div style={styles.seguimientoStats}>
                                        <span>Observaciones: {est.observaciones}</span>
                                        <span>|</span>
                                        <span>Inasistencias: {est.inasistencias}</span>
                                    </div>
                                    <div style={styles.seguimientoFooter}>
                                        Última obs.: {est.ultimaObs}
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
    container: { padding: '20px' },
    pageTitle: { margin: '0 0 5px 0', fontSize: '24px', color: '#2c3e50' },
    pageSubtitle: { margin: '0 0 25px 0', fontSize: '14px', color: '#7f8c8d' },
    
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
    loadingText: { color: '#2c3e50', fontSize: '14px' },
    
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        gap: '15px'
    },
    errorText: { color: '#e74c3c', fontSize: '16px' },
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    statNumber: { display: 'block', fontSize: '28px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' },
    statLabel: { color: '#7f8c8d', fontSize: '13px' },
    
    twoColumnGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '20px',
        minHeight: '250px'
    },
    cardTitle: {
        margin: '0 0 15px 0',
        fontSize: '16px',
        color: '#2c3e50',
        paddingBottom: '10px',
        borderBottom: '2px solid #27ae60'
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#95a5a6',
        padding: '40px 0',
        fontSize: '14px'
    },
    
    nivelesList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    nivelItem: { width: '100%' },
    nivelHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
    nivelNombre: { fontWeight: '500', color: '#2c3e50' },
    nivelCantidad: { color: '#7f8c8d', fontSize: '13px' },
    progressBar: { height: '8px', backgroundColor: '#ecf0f1', borderRadius: '4px', overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#27ae60', borderRadius: '4px' },
    
    seguimientoList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    seguimientoItem: {
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '3px solid #27ae60'
    },
    seguimientoHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
    seguimientoCurso: { color: '#7f8c8d', fontSize: '12px' },
    seguimientoStats: { display: 'flex', gap: '10px', marginBottom: '5px', fontSize: '13px', color: '#2c3e50' },
    seguimientoFooter: { fontSize: '12px', color: '#95a5a6', fontStyle: 'italic' }
};

// Animación global
const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default DirectivoDashboard;
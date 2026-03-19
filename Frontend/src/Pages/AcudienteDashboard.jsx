// Frontend/src/Pages/AcudienteDashboard.jsx
import { useState, useEffect } from 'react';

const AcudienteDashboard = ({ user }) => {
    const [hijo, setHijo] = useState(null);
    const [asistencias, setAsistencias] = useState([]);
    const [observaciones, setObservaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.numeroIdentificacion) {
            fetchHijo();
        }
    }, [user]);

    const fetchHijo = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5000/api/students/acudiente/${user.numeroIdentificacion}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (!response.ok) throw new Error('Error al cargar los datos del estudiante');
            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                // Tomamos el primer hijo de la lista
                const primerHijo = data.data[0];
                setHijo(primerHijo);
                // Una vez que tenemos el hijo, cargamos su asistencia y observaciones
                fetchAsistencias(primerHijo._id);
                fetchObservaciones(primerHijo._id);
            } else {
                setError('No se encontró ningún estudiante asociado a este acudiente.');
                setLoading(false);
            }
        } catch (error) {
            console.error('❌ Error en fetchHijo:', error);
            setError('Error de conexión con el servidor.');
            setLoading(false);
        }
    };

    const fetchAsistencias = async (estudianteId) => {
        try {
            const token = localStorage.getItem('token');
            // Traemos las asistencias de los últimos 30 días (como en tu imagen)
            const response = await fetch(
                `http://localhost:5000/api/attendance/estudiante/${estudianteId}?limit=30`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (!response.ok) throw new Error('Error al cargar asistencias');
            const data = await response.json();
            // La respuesta del backend debería ser { success: true, data: [...] }
            setAsistencias(data.data || []);
        } catch (error) {
            console.error('❌ Error en fetchAsistencias:', error);
            // No mostramos error grave, solo que no hay datos
        }
    };

    const fetchObservaciones = async (estudianteId) => {
        try {
            const token = localStorage.getItem('token');
            // Traemos las observaciones de los últimos 30 días
            const response = await fetch(
                `http://localhost:5000/api/observations/estudiante/${estudianteId}?limit=30`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (!response.ok) throw new Error('Error al cargar observaciones');
            const data = await response.json();
            setObservaciones(data.data || []);
        } catch (error) {
            console.error('❌ Error en fetchObservaciones:', error);
        } finally {
            // Aseguramos que loading se desactive solo después de todos los fetch
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const getEstadoTexto = (estado) => {
        switch (estado) {
            case 'presente': return 'Llegó puntual';
            case 'tarde': return 'Llegó 15 min tarde';
            case 'ausente': return 'Ausente';
            default: return '';
        }
    };

    const getMotivoTexto = (item) => {
        if (item.motivo) {
            const motivos = {
                'enfermedad': 'Enfermedad',
                'permiso': 'Permiso',
                'sin_justificar': 'Sin justificar',
                'otro': 'Otro'
            };
            return motivos[item.motivo] || item.motivo;
        }
        return '';
    };

    if (loading) {
        return <div style={styles.loadingContainer}><div style={styles.loadingSpinner}></div><p>Cargando información de tu hijo...</p></div>;
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorBox}>
                    <p>{error}</p>
                    <button onClick={fetchHijo} style={styles.retryButton}>Reintentar</button>
                </div>
            </div>
        );
    }

    if (!hijo) {
        return (
            <div style={styles.container}>
                <div style={styles.emptyState}>
                    <p>No hay estudiantes asociados a este acudiente.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Panel Acudiente</h2>
            <p style={styles.pageSubtitle}>Consulte el progreso académico de sus hijos</p>

            {/* Información del Hijo (en lugar del selector) */}
            <div style={styles.hijoInfoCard}>
                <span style={styles.hijoInfoLabel}>Estudiante</span>
                <span style={styles.hijoInfoName}>{hijo.apellido1 || hijo.apellido} - {hijo.grado_especifico}</span>
            </div>

            {/* Asistencia Semanal (últimos 5 registros como en tu imagen) */}
            <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Asistencia Semanal</h3>
                <div style={styles.asistenciaList}>
                    {asistencias.length === 0 ? (
                        <p style={styles.emptyMessage}>No hay registros de asistencia para este estudiante.</p>
                    ) : (
                        asistencias.slice(0, 5).map((item, index) => (
                            <div key={index} style={styles.asistenciaItem}>
                                <div style={styles.asistenciaInfo}>
                                    <span style={styles.asistenciaFecha}>{formatDate(item.fecha)}</span>
                                    <span style={styles.asistenciaEstado}>
                                        {getEstadoTexto(item.estado)}
                                        {item.motivo && ` - ${getMotivoTexto(item)}`}
                                    </span>
                                </div>
                                <span style={{
                                    ...styles.estadoBadge,
                                    backgroundColor: item.estado === 'presente' ? '#27ae60' :
                                                      item.estado === 'tarde' ? '#f39c12' : '#e74c3c'
                                }}>
                                    {item.estado === 'presente' ? 'Presente' :
                                     item.estado === 'tarde' ? 'Tardanza' : 'Ausente'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Observaciones Recientes (últimos 2 registros como en tu imagen) */}
            <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Observaciones Recientes</h3>
                <div style={styles.observacionesList}>
                    {observaciones.length === 0 ? (
                        <p style={styles.emptyMessage}>No hay observaciones recientes para este estudiante.</p>
                    ) : (
                        observaciones.slice(0, 2).map((obs, index) => (
                            <div key={index} style={styles.observacionItem}>
                                <div style={styles.observacionHeader}>
                                    <span style={styles.observacionFecha}>{formatDate(obs.fecha)}</span>
                                    <span style={styles.observacionTipo}>
                                        {obs.tipo} - {obs.docenteId?.nombre || 'Docente'}
                                    </span>
                                </div>
                                <p style={styles.observacionDesc}>{obs.descripcion}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// ===========================================
// ESTILOS (Casi idénticos a los que me pasaste en la imagen)
// ===========================================
const styles = {
    container: {
        padding: '24px',
        maxWidth: '900px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
    },
    pageTitle: {
        margin: '0 0 8px 0',
        fontSize: '28px',
        fontWeight: '600',
        color: '#2c3e50',
    },
    pageSubtitle: {
        margin: '0 0 32px 0',
        fontSize: '16px',
        color: '#7f8c8d',
    },
    hijoInfoCard: {
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    hijoInfoLabel: {
        fontSize: '14px',
        color: '#7f8c8d',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    hijoInfoName: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
    },
    sectionCard: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        padding: '24px',
        marginBottom: '24px',
    },
    sectionTitle: {
        margin: '0 0 20px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        borderBottom: '2px solid #27ae60',
        paddingBottom: '12px',
    },
    asistenciaList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    asistenciaItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #edf2f7',
    },
    asistenciaInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    asistenciaFecha: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#2d3748',
    },
    asistenciaEstado: {
        fontSize: '14px',
        color: '#4a5568',
    },
    estadoBadge: {
        padding: '6px 14px',
        borderRadius: '30px',
        color: 'white',
        fontSize: '13px',
        fontWeight: '600',
        textAlign: 'center',
        minWidth: '90px',
    },
    observacionesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    observacionItem: {
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        borderLeft: '4px solid #27ae60',
    },
    observacionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        flexWrap: 'wrap',
        gap: '8px',
    },
    observacionFecha: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2d3748',
    },
    observacionTipo: {
        fontSize: '13px',
        color: '#718096',
        backgroundColor: '#edf2f7',
        padding: '4px 12px',
        borderRadius: '20px',
    },
    observacionDesc: {
        margin: 0,
        fontSize: '14px',
        color: '#2d3748',
        lineHeight: '1.6',
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#a0aec0',
        padding: '32px',
        fontSize: '15px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
    },
    loadingSpinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #e2e8f0',
        borderTop: '3px solid #27ae60',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px',
    },
    errorBox: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
        padding: '24px',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #feb2b2',
    },
    retryButton: {
        padding: '8px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '16px',
        fontWeight: '500',
    },
    emptyState: {
        textAlign: 'center',
        color: '#a0aec0',
        padding: '60px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
};

// Añadir la animación del spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default AcudienteDashboard;
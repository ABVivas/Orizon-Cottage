// Frontend/src/Pages/AcudienteAsistencia.jsx
import { useState, useEffect } from 'react';

const AcudienteAsistencia = ({ user }) => {
    const [hijo, setHijo] = useState(null);
    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.numeroIdentificacion) {
            fetchHijo();
        }
    }, [user]);

    const fetchHijo = async () => {
        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/students/acudiente/${user.numeroIdentificacion}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                const primerHijo = data.data[0];
                setHijo(primerHijo);
                fetchAsistencias(primerHijo._id);
            } else {
                setError('No tiene estudiantes asociados');
                setLoading(false);
            }
        } catch (error) {
            setError('Error de conexión');
            setLoading(false);
        }
    };

    const fetchAsistencias = async (estudianteId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/attendance/estudiante/${estudianteId}?limit=30`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setAsistencias(data.data || []);
        } catch (error) {
            setError('Error al cargar asistencias');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    // 🔥 CORREGIDO: Mostrar el motivo real
    const getEstadoTexto = (item) => {
        if (item.estado === 'presente') return 'Llegó puntual';
        if (item.estado === 'tarde') return 'Llegó 15 min tarde';
        if (item.estado === 'ausente') {
            // Mostrar el motivo real como aparece en la BD
            const motivos = {
                'enfermedad': 'Enfermedad',
                'permiso': 'Permiso',
                'sin_justificar': 'Sin justificar',
                'otro': 'Otro'
            };
            return motivos[item.motivo] || 'Ausente';
        }
        return '';
    };

    const getBadgeEstado = (estado) => {
        switch(estado) {
            case 'presente': return { bg: '#27ae60', text: 'Presente' };
            case 'tarde': return { bg: '#f39c12', text: 'Tardanza' };
            case 'ausente': return { bg: '#e74c3c', text: 'Ausente' };
            default: return { bg: '#95a5a6', text: 'Sin registrar' };
        }
    };

    if (loading) return <div style={styles.loading}>Cargando...</div>;

    if (error) {
        return (
            <div style={styles.container}>
                <h2 style={styles.pageTitle}>Consulta de Asistencia</h2>
                <p style={styles.pageSubtitle}>Consulte el registro de asistencia de sus hijos</p>
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
                <h2 style={styles.pageTitle}>Consulta de Asistencia</h2>
                <p style={styles.pageSubtitle}>Consulte el registro de asistencia de sus hijos</p>
                <div style={styles.emptyState}>
                    <p>No hay información disponible</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Consulta de Asistencia</h2>
            <p style={styles.pageSubtitle}>Consulte el registro de asistencia de sus hijos</p>

            {/* Estudiante */}
            <div style={styles.estudianteContainer}>
                <strong>Estudiante</strong>
                <div style={styles.estudianteNombre}>
                    {hijo.apellido1 || hijo.apellido} - {hijo.grado_especifico || hijo.grado}
                </div>
            </div>

            {/* Registro de Asistencia */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Registro de Asistencia - Últimos 30 días</h3>
                <div>
                    {asistencias.length === 0 ? (
                        <p style={styles.emptyMessage}>No hay registros de asistencia</p>
                    ) : (
                        asistencias.map((item, index) => {
                            const badge = getBadgeEstado(item.estado);
                            return (
                                <div key={index} style={styles.asistenciaItem}>
                                    <div style={styles.asistenciaInfo}>
                                        <span style={styles.asistenciaFecha}>{formatDate(item.fecha)}</span>
                                        <span style={styles.asistenciaEstado}>
                                            {getEstadoTexto(item)}
                                        </span>
                                    </div>
                                    <span style={{
                                        ...styles.estadoBadge,
                                        backgroundColor: badge.bg
                                    }}>
                                        {badge.text}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
    loading: { textAlign: 'center', padding: '50px' },
    pageTitle: { margin: '0 0 5px 0', fontSize: '28px', fontWeight: '600', color: '#2c3e50' },
    pageSubtitle: { margin: '0 0 24px 0', fontSize: '16px', color: '#7f8c8d' },
    
    estudianteContainer: {
        backgroundColor: '#f8f9fa',
        padding: '16px 20px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid #e0e0e0'
    },
    estudianteNombre: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        marginTop: '6px'
    },
    
    section: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        padding: '20px'
    },
    sectionTitle: {
        margin: '0 0 20px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        borderBottom: '2px solid #27ae60',
        paddingBottom: '8px'
    },
    
    asistenciaItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        borderBottom: '1px solid #ecf0f1'
    },
    asistenciaInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    asistenciaFecha: {
        fontWeight: '600',
        color: '#2d3748'
    },
    asistenciaEstado: {
        fontSize: '13px',
        color: '#718096'
    },
    estadoBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        minWidth: '80px',
        textAlign: 'center'
    },
    
    errorBox: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
        padding: '24px',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #feb2b2'
    },
    retryButton: {
        padding: '8px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '10px'
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#a0aec0',
        padding: '40px',
        fontSize: '14px'
    },
    emptyState: {
        textAlign: 'center',
        color: '#a0aec0',
        padding: '60px'
    }
};

export default AcudienteAsistencia;
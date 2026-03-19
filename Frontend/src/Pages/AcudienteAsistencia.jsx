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

    const getEstadoTexto = (item) => {
        if (item.estado === 'presente') return 'Llegó puntual';
        if (item.estado === 'tarde') return 'Llegó 15 min tarde';
        if (item.estado === 'ausente') {
            if (item.motivo === 'enfermedad') return 'Cita médica';
            if (item.motivo === 'permiso') return 'Permiso';
            return 'Ausente';
        }
        return '';
    };

    if (loading) return <div style={styles.loading}>Cargando...</div>;

    if (error) {
        return (
            <div style={styles.container}>
                <h2 style={styles.pageTitle}>Control de Asistencia</h2>
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
                <h2 style={styles.pageTitle}>Control de Asistencia</h2>
                <p style={styles.pageSubtitle}>Consulte el registro de asistencia de sus hijos</p>
                <div style={styles.emptyState}>
                    <p>No hay información disponible</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Control de Asistencia</h2>
            <p style={styles.pageSubtitle}>Consulte el registro de asistencia de sus hijos</p>

            {/* Estudiante - IGUAL QUE EN LA IMAGEN */}
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
                        asistencias.map((item, index) => (
                            <div key={index} style={styles.asistenciaItem}>
                                <div style={styles.asistenciaInfo}>
                                    <span style={styles.asistenciaFecha}>{formatDate(item.fecha)}</span>
                                    <span style={styles.asistenciaEstado}>
                                        {getEstadoTexto(item)}
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
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '900px', margin: '0 auto' },
    loading: { textAlign: 'center', padding: '50px' },
    pageTitle: { margin: '0 0 5px 0', fontSize: '24px', color: '#2c3e50' },
    pageSubtitle: { margin: '0 0 20px 0', fontSize: '14px', color: '#7f8c8d' },
    
    estudianteContainer: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e0e0e0'
    },
    estudianteNombre: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#2c3e50',
        marginTop: '5px'
    },
    
    section: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px'
    },
    sectionTitle: {
        margin: '0 0 15px 0',
        fontSize: '18px',
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
        flexDirection: 'column'
    },
    asistenciaFecha: {
        fontWeight: '500',
        color: '#2c3e50'
    },
    asistenciaEstado: {
        fontSize: '13px',
        color: '#7f8c8d'
    },
    estadoBadge: {
        padding: '4px 10px',
        borderRadius: '15px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    
    errorBox: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '20px'
    },
    retryButton: {
        padding: '8px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px'
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#95a5a6',
        padding: '30px'
    },
    emptyState: {
        textAlign: 'center',
        color: '#95a5a6',
        padding: '50px'
    }
};

export default AcudienteAsistencia;
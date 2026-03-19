// Frontend/src/Pages/AcudienteObservaciones.jsx
import { useState, useEffect } from 'react';

const AcudienteObservaciones = ({ user }) => {
    const [hijo, setHijo] = useState(null);
    const [observaciones, setObservaciones] = useState([]);
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
                fetchObservaciones(primerHijo._id);
            } else {
                setError('No tiene estudiantes asociados');
                setLoading(false);
            }
        } catch (error) {
            setError('Error de conexión');
            setLoading(false);
        }
    };

    const fetchObservaciones = async (estudianteId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/observations/estudiante/${estudianteId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setObservaciones(data.data || []);
        } catch (error) {
            setError('Error al cargar observaciones');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const getNivelInfo = (nivel) => {
        switch(nivel) {
            case 'Tipo I': return { color: '#27ae60', texto: 'Tipo I - Leve' };
            case 'Tipo II': return { color: '#f39c12', texto: 'Tipo II - Grave' };
            case 'Tipo III': return { color: '#e74c3c', texto: 'Tipo III - Gravísima' };
            default: return { color: '#95a5a6', texto: nivel };
        }
    };

    const handleMarcarRevisado = (obsId) => {
        alert('Función: Marcar como Revisado (próximamente)');
    };

    const handleSolicitarRevision = (obsId) => {
        alert('Función: Solicitar revisión (próximamente)');
    };

    if (loading) return <div style={styles.loading}>Cargando...</div>;

    if (error) {
        return (
            <div style={styles.container}>
                <h2 style={styles.pageTitle}>Observaciones y Planes de Mejora</h2>
                <p style={styles.pageSubtitle}>Revise las observaciones y seguimiento de sus hijos</p>
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
                <h2 style={styles.pageTitle}>Observaciones y Planes de Mejora</h2>
                <p style={styles.pageSubtitle}>Revise las observaciones y seguimiento de sus hijos</p>
                <div style={styles.emptyState}>
                    <p>No hay información disponible</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Observaciones y Planes de Mejora</h2>
            <p style={styles.pageSubtitle}>Revise las observaciones y seguimiento de sus hijos</p>

            {/* Estudiante - IGUAL QUE EN LA IMAGEN */}
            <div style={styles.estudianteContainer}>
                <strong>Estudiante</strong>
                <div style={styles.estudianteNombre}>
                    {hijo.apellido1 || hijo.apellido} - {hijo.grado_especifico || hijo.grado}
                </div>
            </div>

            {/* Lista de observaciones */}
            <div>
                {observaciones.length === 0 ? (
                    <p style={styles.emptyMessage}>No hay observaciones para este estudiante</p>
                ) : (
                    observaciones.map((obs) => {
                        const nivelInfo = getNivelInfo(obs.nivel);
                        return (
                            <div key={obs._id} style={styles.obsCard}>
                                <div style={styles.obsHeader}>
                                    <span style={styles.obsTitulo}>
                                        Observación {obs.tipo} 
                                        <span style={{
                                            ...styles.nivelBadge,
                                            backgroundColor: nivelInfo.color
                                        }}>
                                            {nivelInfo.texto}
                                        </span>
                                    </span>
                                    <span style={styles.obsFecha}>{formatDate(obs.fecha)}</span>
                                </div>

                                <div style={styles.obsBody}>
                                    <p><strong>Descripción:</strong> {obs.descripcion}</p>
                                    <p><strong>Docente:</strong> {obs.docenteId?.nombre || 'No especificado'}</p>
                                    
                                    {obs.planMejora && (
                                        <>
                                            <p><strong>Plan de Mejora:</strong> {obs.planMejora}</p>
                                        </>
                                    )}

                                    {/* NUEVO: Mostrar documento si existe */}
                                    {obs.documentoPlan && (
                                        <div style={styles.documentoSection}>
                                            <p><strong>Documento del Plan de Mejora:</strong></p>
                                            <a 
                                                href={`http://localhost:5000${obs.documentoPlan.url}`} 
                                                style={styles.documentoLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                📎 {obs.documentoPlan.nombre}
                                            </a>
                                            <p style={styles.documentoNota}>
                                                Subido el {new Date(obs.documentoPlan.fechaSubida).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    <div style={styles.actionButtons}>
                                        <button style={styles.revisadoButton} onClick={() => handleMarcarRevisado(obs._id)}>
                                            Marcar como Revisado
                                        </button>
                                        <button style={styles.solicitarButton} onClick={() => handleSolicitarRevision(obs._id)}>
                                            Solicitar Revisión
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { 
        padding: '24px', 
        maxWidth: '900px', 
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif'
    },
    loading: { 
        textAlign: 'center', 
        padding: '50px' 
    },
    pageTitle: { 
        margin: '0 0 5px 0', 
        fontSize: '28px', 
        fontWeight: '600',
        color: '#2c3e50' 
    },
    pageSubtitle: { 
        margin: '0 0 24px 0', 
        fontSize: '16px', 
        color: '#7f8c8d' 
    },
    
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
    
    obsCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        marginBottom: '24px',
        overflow: 'hidden',
        border: '1px solid #edf2f7'
    },
    obsHeader: {
        padding: '16px 20px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
    },
    obsTitulo: {
        fontWeight: '600',
        color: '#2d3748',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap'
    },
    nivelBadge: {
        padding: '4px 12px',
        borderRadius: '30px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        marginLeft: '8px'
    },
    obsFecha: {
        color: '#718096',
        fontSize: '14px'
    },
    obsBody: {
        padding: '20px'
    },
    documentoSection: {
        marginTop: '16px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    },
    documentoLink: {
        color: '#3182ce',
        textDecoration: 'none',
        fontWeight: '500',
        display: 'inline-block',
        padding: '4px 0',
        ':hover': {
            textDecoration: 'underline'
        }
    },
    documentoNota: {
        marginTop: '8px',
        fontSize: '12px',
        color: '#718096',
        fontStyle: 'italic'
    },
    actionButtons: {
        display: 'flex',
        gap: '12px',
        marginTop: '20px'
    },
    revisadoButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
        ':hover': {
            backgroundColor: '#219a52'
        }
    },
    solicitarButton: {
        padding: '10px 20px',
        backgroundColor: '#3182ce',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
        ':hover': {
            backgroundColor: '#2c5282'
        }
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
        padding: '10px 24px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '16px',
        fontWeight: '500'
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#a0aec0',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '12px',
        fontSize: '16px'
    },
    emptyState: {
        textAlign: 'center',
        color: '#a0aec0',
        padding: '60px'
    }
};

export default AcudienteObservaciones;
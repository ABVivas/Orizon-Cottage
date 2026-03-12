// Frontend/src/Pages/DocenteHistorial.jsx
import { useState, useEffect } from 'react';

const DocenteHistorial = ({ user }) => {
    const [activeTab, setActiveTab] = useState('inasistencias');
    const [inasistencias, setInasistencias] = useState([]);
    const [observaciones, setObservaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistorial();
    }, [user]);

    const fetchHistorial = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Obtener inasistencias
            const attendanceRes = await fetch(`http://localhost:5000/api/attendance/docente/${user.id}?limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const attendanceData = await attendanceRes.json();
            setInasistencias(attendanceData.data || []);

            // Obtener observaciones
            const obsRes = await fetch(`http://localhost:5000/api/observations/docente/${user.id}?limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const obsData = await obsRes.json();
            setObservaciones(obsData.data || []);

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Historial</h2>
            <p style={styles.subtitle}>Consulte el historial de inasistencias y observaciones</p>

            <div style={styles.tabContainer}>
                <button 
                    style={{...styles.tab, ...(activeTab === 'inasistencias' && styles.activeTab)}}
                    onClick={() => setActiveTab('inasistencias')}
                >
                    Inasistencias
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'observaciones' && styles.activeTab)}}
                    onClick={() => setActiveTab('observaciones')}
                >
                    Observaciones
                </button>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div style={styles.content}>
                    {activeTab === 'inasistencias' && (
                        <div style={styles.list}>
                            {inasistencias.length === 0 ? (
                                <p style={styles.emptyMessage}>No hay inasistencias registradas</p>
                            ) : (
                                inasistencias.map((item, index) => (
                                    <div key={index} style={styles.listItem}>
                                        <div style={styles.itemMain}>
                                            <strong>{item.estudiante || 'Estudiante'}</strong>
                                            <span style={styles.itemCurso}>{item.curso || ''}</span>
                                            <span style={styles.itemDate}>
                                                {formatDate(item.fecha)}
                                            </span>
                                        </div>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: item.justificada ? '#27ae60' : '#e74c3c'
                                        }}>
                                            {item.justificada ? 'Justificada' : 'Sin justificar'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'observaciones' && (
                        <div style={styles.list}>
                            {observaciones.length === 0 ? (
                                <p style={styles.emptyMessage}>No hay observaciones registradas</p>
                            ) : (
                                observaciones.map((item, index) => (
                                    <div key={index} style={styles.listItem}>
                                        <div style={styles.itemMain}>
                                            <strong>{item.estudiante || 'Estudiante'}</strong>
                                            <span style={styles.itemCurso}>{item.curso || ''}</span>
                                            <span style={styles.itemDate}>
                                                {formatDate(item.fecha)}
                                            </span>
                                        </div>
                                        <div style={styles.itemDetails}>
                                            <span style={{
                                                ...styles.tipoBadge,
                                                backgroundColor: item.tipo === 'Disciplinaria' ? '#e74c3c' : '#3498db'
                                            }}>
                                                {item.tipo || 'General'}
                                            </span>
                                            <span style={styles.itemNivel}>
                                                {item.nivel || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px'
    },
    title: {
        margin: '0 0 5px 0',
        color: '#2c3e50',
        fontSize: '22px'
    },
    subtitle: {
        margin: '0 0 30px 0',
        color: '#7f8c8d',
        fontSize: '14px'
    },
    tabContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #ecf0f1',
        paddingBottom: '10px'
    },
    tab: {
        padding: '10px 20px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#7f8c8d',
        borderRadius: '5px 5px 0 0'
    },
    activeTab: {
        color: '#27ae60',
        borderBottom: '2px solid #27ae60',
        fontWeight: 'bold'
    },
    content: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '20px'
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px',
        borderLeft: '3px solid #27ae60'
    },
    itemMain: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center'
    },
    itemCurso: {
        color: '#7f8c8d',
        fontSize: '13px'
    },
    itemDate: {
        color: '#7f8c8d',
        fontSize: '12px'
    },
    itemDetails: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
    },
    badge: {
        padding: '3px 8px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '11px',
        fontWeight: 'bold'
    },
    tipoBadge: {
        padding: '3px 8px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '11px',
        fontWeight: 'bold'
    },
    itemNivel: {
        color: '#2c3e50',
        fontSize: '12px'
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#95a5a6',
        padding: '40px'
    }
};

export default DocenteHistorial;
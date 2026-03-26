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
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Obtener inasistencias del docente (con los estudiantes poblados)
            const attendanceRes = await fetch(`http://localhost:5000/api/attendance/docente/${user.id}?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const attendanceData = await attendanceRes.json();
            
            // Procesar las inasistencias para extraer los datos del estudiante
            const processedInasistencias = (attendanceData.data || []).map(item => {
                // studentId puede ser un objeto (si está poblado) o un string
                const student = item.studentId || {};
                return {
                    _id: item._id,
                    estudiante: student.apellido1 || student.apellido || 'Estudiante',
                    curso: student.grado_especifico || student.grado || '',
                    fecha: item.fecha,
                    estado: item.estado,
                    motivo: item.motivo,
                    observacion: item.observacion,
                    justificada: item.motivo && item.motivo !== ''
                };
            });
            
            setInasistencias(processedInasistencias);

            // Obtener observaciones del docente (con los estudiantes poblados)
            const obsRes = await fetch(`http://localhost:5000/api/observations/docente/${user.id}?limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const obsData = await obsRes.json();
            
            // Procesar las observaciones para extraer los datos del estudiante
            const processedObservaciones = (obsData.data || []).map(item => {
                const student = item.studentId || {};
                return {
                    _id: item._id,
                    estudiante: student.apellido1 || student.apellido || 'Estudiante',
                    curso: student.grado_especifico || student.grado || '',
                    fecha: item.fecha,
                    tipo: item.tipo,
                    nivel: item.nivel,
                    descripcion: item.descripcion,
                    planMejora: item.planMejora
                };
            });
            
            setObservaciones(processedObservaciones);

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const getEstadoTexto = (estado) => {
        switch(estado) {
            case 'presente': return 'Presente';
            case 'ausente': return 'Ausente';
            case 'tarde': return 'Tardanza';
            default: return '';
        }
    };

    const getMotivoTexto = (motivo) => {
        const motivos = {
            'enfermedad': 'Enfermedad',
            'permiso': 'Permiso',
            'sin_justificar': 'Sin justificar',
            'otro': 'Otro'
        };
        return motivos[motivo] || motivo;
    };

    const getNivelInfo = (nivel) => {
        switch(nivel) {
            case 'Tipo I': return { color: '#27ae60', texto: 'Tipo I' };
            case 'Tipo II': return { color: '#f39c12', texto: 'Tipo II' };
            case 'Tipo III': return { color: '#e74c3c', texto: 'Tipo III' };
            default: return { color: '#95a5a6', texto: nivel };
        }
    };

    if (loading) {
        return <div style={styles.loading}>Cargando historial...</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Historial</h2>
            <p style={styles.subtitle}>Consulte el historial de inasistencias y observaciones</p>

            <div style={styles.tabContainer}>
                <button 
                    style={{...styles.tab, ...(activeTab === 'inasistencias' && styles.activeTab)}}
                    onClick={() => setActiveTab('inasistencias')}
                >
                    Inasistencias ({inasistencias.length})
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'observaciones' && styles.activeTab)}}
                    onClick={() => setActiveTab('observaciones')}
                >
                    Observaciones ({observaciones.length})
                </button>
            </div>

            <div style={styles.content}>
                {activeTab === 'inasistencias' && (
                    <div style={styles.list}>
                        {inasistencias.length === 0 ? (
                            <p style={styles.emptyMessage}>No hay inasistencias registradas</p>
                        ) : (
                            inasistencias.map((item) => (
                                <div key={item._id} style={styles.listItem}>
                                    <div style={styles.itemMain}>
                                        <strong style={styles.studentName}>{item.estudiante}</strong>
                                        <span style={styles.itemCurso}>{item.curso}</span>
                                        <span style={styles.itemDate}>
                                            {formatDate(item.fecha)}
                                        </span>
                                        {item.motivo && (
                                            <span style={styles.motivoText}>
                                                {getMotivoTexto(item.motivo)}
                                            </span>
                                        )}
                                    </div>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: item.estado === 'presente' ? '#27ae60' :
                                                        item.estado === 'tarde' ? '#f39c12' : '#e74c3c'
                                    }}>
                                        {getEstadoTexto(item.estado)}
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
                            observaciones.map((item) => {
                                const nivelInfo = getNivelInfo(item.nivel);
                                return (
                                    <div key={item._id} style={styles.listItem}>
                                        <div style={styles.itemMain}>
                                            <strong style={styles.studentName}>{item.estudiante}</strong>
                                            <span style={styles.itemCurso}>{item.curso}</span>
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
                                            <span style={{
                                                ...styles.nivelBadge,
                                                backgroundColor: nivelInfo.color
                                            }}>
                                                {nivelInfo.texto}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1000px',
        margin: '0 auto'
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        color: '#7f8c8d'
    },
    title: {
        margin: '0 0 5px 0',
        color: '#2c3e50',
        fontSize: '28px',
        fontWeight: '600'
    },
    subtitle: {
        margin: '0 0 30px 0',
        color: '#7f8c8d',
        fontSize: '16px'
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
        borderRadius: '5px 5px 0 0',
        transition: 'all 0.2s'
    },
    activeTab: {
        color: '#27ae60',
        borderBottom: '2px solid #27ae60',
        fontWeight: 'bold'
    },
    content: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        padding: '20px'
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        borderLeft: '3px solid #27ae60',
        flexWrap: 'wrap',
        gap: '10px'
    },
    itemMain: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    studentName: {
        color: '#2d3748',
        fontSize: '14px'
    },
    itemCurso: {
        color: '#718096',
        fontSize: '12px',
        backgroundColor: '#e2e8f0',
        padding: '2px 8px',
        borderRadius: '20px'
    },
    itemDate: {
        color: '#718096',
        fontSize: '12px'
    },
    motivoText: {
        fontSize: '11px',
        color: '#718096',
        fontStyle: 'italic',
        backgroundColor: '#edf2f7',
        padding: '2px 8px',
        borderRadius: '20px'
    },
    itemDetails: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600'
    },
    tipoBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600'
    },
    nivelBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600'
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#a0aec0',
        padding: '40px',
        fontSize: '14px'
    }
};

export default DocenteHistorial;    
// Frontend/src/Pages/DocenteHistorial.jsx
// Frontend/src/Pages/DocenteHistorial.jsx
import { useState, useEffect } from 'react';

const DocenteHistorial = ({ user }) => {
    const [activeTab, setActiveTab] = useState('inasistencias');
    const [inasistencias, setInasistencias] = useState([]);
    const [observaciones, setObservaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchHistorial();
    }, [user]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const fetchHistorial = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Obtener inasistencias del docente (con los estudiantes poblados)
            const attendanceRes = await fetch(`http://localhost:5000/api/attendance/docente/${user.id}?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const attendanceData = await attendanceRes.json();
            
            // Procesar las inasistencias
            const processedInasistencias = (attendanceData.data || []).map(item => {
                const student = item.studentId || {};
                const fecha = new Date(item.fecha);
                
                const motivoMap = {
                    'enfermedad': 'Enfermedad',
                    'permiso': 'Permiso',
                    'sin_justificar': 'Sin justificar',
                    'otro': 'Otro'
                };
                
                const estadoMap = {
                    'presente': 'Presente',
                    'ausente': 'Ausente',
                    'tarde': 'Tardanza'
                };
                
                return {
                    _id: item._id,
                    estudiante: student.apellido1 || student.apellido || 'Estudiante',
                    curso: student.grado_especifico || student.grado || '',
                    fecha: fecha,
                    fechaStr: fecha.toLocaleDateString('es-ES'),
                    estado: item.estado,
                    estadoTexto: estadoMap[item.estado] || item.estado,
                    motivo: item.motivo,
                    motivoTexto: motivoMap[item.motivo] || item.motivo || 'Sin motivo',
                    observacion: item.observacion || '',
                    registradoPor: item.registradoPor
                };
            });
            
            // Ordenar por fecha descendente
            processedInasistencias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            setInasistencias(processedInasistencias);
            
            // Obtener observaciones del docente (con los estudiantes poblados)
            const obsRes = await fetch(`http://localhost:5000/api/observations/docente/${user.id}?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const obsData = await obsRes.json();
            
            // Procesar las observaciones
            const processedObservaciones = (obsData.data || []).map(item => {
                const student = item.studentId || {};
                const fecha = new Date(item.fecha);
                
                const tipoMap = {
                    'Académica': 'Académica',
                    'Disciplinaria': 'Disciplinaria',
                    'General': 'General'
                };
                
                return {
                    _id: item._id,
                    estudiante: student.apellido1 || student.apellido || 'Estudiante',
                    curso: student.grado_especifico || student.grado || '',
                    fecha: fecha,
                    fechaStr: fecha.toLocaleDateString('es-ES'),
                    tipo: item.tipo,
                    tipoTexto: tipoMap[item.tipo] || item.tipo || 'General',
                    nivel: item.nivel || 'No especificado',
                    descripcion: item.descripcion || '',
                    planMejora: item.planMejora || ''
                };
            });
            
            // Ordenar por fecha descendente
            processedObservaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            setObservaciones(processedObservaciones);
            
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
    };

    const getEstadoColor = (estado) => {
        switch(estado) {
            case 'presente': return '#27ae60';
            case 'ausente': return '#e74c3c';
            case 'tarde': return '#f39c12';
            default: return '#95a5a6';
        }
    };

    const getMotivoColor = (motivo) => {
        switch(motivo) {
            case 'enfermedad': return '#e67e22';
            case 'permiso': return '#3498db';
            case 'sin_justificar': return '#e74c3c';
            default: return '#7f8c8d';
        }
    };

    const getNivelColor = (nivel) => {
        if (nivel === 'Tipo I') return '#27ae60';
        if (nivel === 'Tipo II') return '#f39c12';
        if (nivel === 'Tipo III') return '#e74c3c';
        return '#95a5a6';
    };

    const getTipoColor = (tipo) => {
        if (tipo === 'Académica') return '#3498db';
        if (tipo === 'Disciplinaria') return '#e74c3c';
        if (tipo === 'General') return '#9b59b6';
        return '#95a5a6';
    };

    // Paginación
    const currentData = activeTab === 'inasistencias' ? inasistencias : observaciones;
    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    const paginatedData = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p>Cargando historial...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Historial</h2>
            <p style={styles.subtitle}>Consulte el historial de inasistencias y observaciones</p>
            
            {/* Tabs */}
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
            
            {/* Contenido */}
            <div style={styles.content}>
                {activeTab === 'inasistencias' && (
                    <>
                        {paginatedData.length === 0 ? (
                            <p style={styles.emptyMessage}>No hay inasistencias registradas</p>
                        ) : (
                            <div style={styles.list}>
                                {paginatedData.map((item) => (
                                    <div key={item._id} style={styles.listItem}>
                                        <div style={styles.itemHeader}>
                                            <strong style={styles.studentName}>{item.estudiante}</strong>
                                            <span style={styles.itemCurso}>{item.curso}</span>
                                            <span style={styles.itemDate}>{item.fechaStr}</span>
                                        </div>
                                        
                                        <div style={styles.itemDetails}>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: getEstadoColor(item.estado)
                                            }}>
                                                {item.estadoTexto}
                                            </span>
                                            {item.motivo && item.motivo !== '' && (
                                                <span style={{
                                                    ...styles.badge,
                                                    backgroundColor: getMotivoColor(item.motivo)
                                                }}>
                                                    {item.motivoTexto}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Descripción/Observación de la inasistencia */}
                                        {item.observacion && item.observacion !== '' && (
                                            <div style={styles.descripcionBox}>
                                                <strong>📝 Observación:</strong>
                                                <p>{item.observacion}</p>
                                            </div>
                                        )}
                                        
                                        {!item.observacion && (
                                            <div style={styles.descripcionBox}>
                                                <em style={styles.sinDescripcion}>Sin observación adicional</em>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
                
                {activeTab === 'observaciones' && (
                    <>
                        {paginatedData.length === 0 ? (
                            <p style={styles.emptyMessage}>No hay observaciones registradas</p>
                        ) : (
                            <div style={styles.list}>
                                {paginatedData.map((item) => (
                                    <div key={item._id} style={styles.listItem}>
                                        <div style={styles.itemHeader}>
                                            <strong style={styles.studentName}>{item.estudiante}</strong>
                                            <span style={styles.itemCurso}>{item.curso}</span>
                                            <span style={styles.itemDate}>{item.fechaStr}</span>
                                        </div>
                                        
                                        <div style={styles.itemDetails}>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: getTipoColor(item.tipo)
                                            }}>
                                                {item.tipoTexto}
                                            </span>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: getNivelColor(item.nivel)
                                            }}>
                                                {item.nivel}
                                            </span>
                                        </div>
                                        
                                        {/* Descripción completa de la observación */}
                                        <div style={styles.descripcionBox}>
                                            <strong>📝 Descripción:</strong>
                                            <p>{item.descripcion || 'Sin descripción'}</p>
                                        </div>
                                        
                                        {/* Plan de mejora si existe */}
                                        {item.planMejora && item.planMejora !== '' && (
                                            <div style={styles.planBox}>
                                                <strong>📋 Plan de Mejora:</strong>
                                                <p>{item.planMejora}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Paginación */}
            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={styles.pageButton}
                    >
                        Anterior
                    </button>
                    <span style={styles.pageInfo}>
                        Página {currentPage} de {totalPages} ({currentData.length} registros)
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={styles.pageButton}
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1000px',
        margin: '0 auto'
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
    title: {
        margin: '0 0 5px 0',
        fontSize: '28px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    subtitle: {
        margin: '0 0 24px 0',
        fontSize: '14px',
        color: '#7f8c8d'
    },
    tabContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #ecf0f1',
        paddingBottom: '10px'
    },
    tab: {
        padding: '10px 24px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '15px',
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
        padding: '20px',
        minHeight: '400px'
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    listItem: {
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        borderLeft: '3px solid #27ae60'
    },
    itemHeader: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
    },
    studentName: {
        fontSize: '15px',
        color: '#2c3e50'
    },
    itemCurso: {
        fontSize: '12px',
        color: '#7f8c8d',
        backgroundColor: '#ecf0f1',
        padding: '2px 8px',
        borderRadius: '12px'
    },
    itemDate: {
        fontSize: '12px',
        color: '#7f8c8d'
    },
    itemDetails: {
        display: 'flex',
        gap: '8px',
        marginBottom: '10px',
        flexWrap: 'wrap'
    },
    badge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '11px',
        fontWeight: '600',
        display: 'inline-block'
    },
    descripcionBox: {
        marginTop: '8px',
        padding: '10px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    },
    planBox: {
        marginTop: '8px',
        padding: '10px',
        backgroundColor: '#fff8e7',
        borderRadius: '8px',
        borderLeft: '3px solid #f39c12'
    },
    sinDescripcion: {
        color: '#95a5a6',
        fontSize: '12px'
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#a0aec0',
        padding: '60px',
        fontSize: '14px'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        marginTop: '20px',
        padding: '15px'
    },
    pageButton: {
        padding: '8px 16px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    pageInfo: {
        color: '#2c3e50',
        fontSize: '14px'
    }
};

// Animación para el spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default DocenteHistorial;
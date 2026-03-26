// Frontend/src/Pages/DocenteDashboard.jsx
import { useState, useEffect } from 'react';

const DocenteDashboard = ({ user, setActiveSection }) => {
    const [stats, setStats] = useState({
        totalEstudiantes: 0,
        porcentajeInasistencias: 0
    });
    const [inasistenciasRecientes, setInasistenciasRecientes] = useState([]);
    const [observacionesRecientes, setObservacionesRecientes] = useState([]);
    const [gradosDocente, setGradosDocente] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
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

            // 1. Obtener estudiantes del docente
            const studentsRes = await fetch(`http://localhost:5000/api/students/docente/${docenteId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!studentsRes.ok) throw new Error('Error al cargar estudiantes');
            const studentsData = await studentsRes.json();
            
            setGradosDocente(studentsData.grados || []);
            const totalEstudiantes = studentsData.count || 0;

            // 2. Obtener asistencias de los últimos 30 días
            const hoy = new Date();
            const hace30Dias = new Date();
            hace30Dias.setDate(hoy.getDate() - 30);

            const attendanceRes = await fetch(
                `http://localhost:5000/api/attendance/docente/${docenteId}?limit=500&startDate=${hace30Dias.toISOString().split('T')[0]}&endDate=${hoy.toISOString().split('T')[0]}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            let attendanceData = { data: [] };
            if (attendanceRes.ok) {
                attendanceData = await attendanceRes.json();
            }

            const asistencias = attendanceData.data || [];

            // Calcular estudiantes ÚNICOS con inasistencias
            const estudiantesConInasistenciaSet = new Set();

            asistencias.forEach(item => {
                const estado = item.estado;
                const studentId = item.studentId?._id?.toString() || item.studentId?.toString();
                
                if (studentId && (estado === 'ausente' || estado === 'tarde')) {
                    estudiantesConInasistenciaSet.add(studentId);
                }
            });

            const estudiantesConInasistencia = estudiantesConInasistenciaSet.size;
            const porcentajeInasistencias = totalEstudiantes > 0 
                ? Math.round((estudiantesConInasistencia / totalEstudiantes) * 100) 
                : 0;

            console.log('📊 Cálculo de inasistencias:');
            console.log('   Total estudiantes:', totalEstudiantes);
            console.log('   Estudiantes con inasistencias:', estudiantesConInasistencia);
            console.log('   Porcentaje:', porcentajeInasistencias + '%');

            setStats({
                totalEstudiantes,
                porcentajeInasistencias
            });

            // 3. Inasistencias recientes (últimos 5 registros NO presentes)
            const inasistenciasFiltradas = asistencias
                .filter(a => a.estado !== 'presente')
                .slice(0, 5)
                .map(item => {
                    const estaJustificada = item.motivo && item.motivo !== '' && item.motivo !== 'sin_justificar';
                    
                    return {
                        _id: item._id,
                        estudiante: item.studentId?.apellido1 || item.studentId?.apellido || 'Estudiante',
                        curso: item.studentId?.grado_especifico || '',
                        fecha: item.fecha,
                        justificada: estaJustificada,
                        motivo: item.motivo,
                        estado: item.estado
                    };
                });

            setInasistenciasRecientes(inasistenciasFiltradas);

            // 4. Observaciones recientes
            const obsRes = await fetch(`http://localhost:5000/api/observations/docente/${docenteId}?limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            let obsData = { data: [] };
            if (obsRes.ok) {
                obsData = await obsRes.json();
            }

            const observacionesFormateadas = (obsData.data || []).map(item => ({
                _id: item._id,
                estudiante: item.studentId?.apellido1 || item.studentId?.apellido || 'Estudiante',
                tipo: item.tipo || 'General',
                fecha: item.fecha,
                nivel: item.nivel || 'N/A'
            }));

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

    const getMotivoTexto = (motivo) => {
        const motivos = {
            'enfermedad': 'Enfermedad',
            'permiso': 'Permiso',
            'sin_justificar': 'Sin justificar',
            'otro': 'Otro'
        };
        return motivos[motivo] || motivo || 'Sin motivo';
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p>Cargando panel del docente...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <p>Error: {error}</p>
                <button onClick={fetchData} style={styles.retryButton}>Reintentar</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
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

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{stats.totalEstudiantes}</span>
                    <span style={styles.statLabel}>Estudiantes</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{stats.porcentajeInasistencias}%</span>
                    <span style={styles.statLabel}>Inasistencias (últ. 30 días)</span>
                </div>
            </div>

            {/* Inasistencias Recientes */}
            <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                    <h3 style={styles.sectionTitle}>
                        <span style={styles.sectionIcon}>📋</span>
                        Inasistencias Recientes
                    </h3>
                    <button 
                        style={styles.viewAllButton} 
                        onClick={() => setActiveSection && setActiveSection('historial')}
                    >
                        Ver todas →
                    </button>
                </div>
                
                {inasistenciasRecientes.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={styles.emptyIcon}>✅</span>
                        <p>No hay inasistencias recientes</p>
                        <p style={styles.emptySubtext}>Todos los estudiantes han asistido hoy</p>
                    </div>
                ) : (
                    <div style={styles.listContainer}>
                        {inasistenciasRecientes.map((item) => (
                            <div key={item._id} style={styles.listItem}>
                                <div style={styles.itemHeader}>
                                    <strong>{item.estudiante}</strong>
                                    <span style={styles.itemCurso}>{item.curso}</span>
                                </div>
                                <div style={styles.itemDetails}>
                                    <span style={styles.itemDate}>
                                        {formatDate(item.fecha)}
                                    </span>
                                    <span style={styles.motivoBadge}>
                                        {getMotivoTexto(item.motivo)}
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
                    <button 
                        style={styles.viewAllButton}
                        onClick={() => setActiveSection && setActiveSection('historial')}
                    >
                        Ver todas →
                    </button>
                </div>
                
                {observacionesRecientes.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={styles.emptyIcon}>📭</span>
                        <p>No hay observaciones recientes</p>
                        <p style={styles.emptySubtext}>Las nuevas observaciones aparecerán aquí</p>
                    </div>
                ) : (
                    <div style={styles.listContainer}>
                        {observacionesRecientes.map((item) => (
                            <div key={item._id} style={styles.listItem}>
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
                                            item.nivel === 'Tipo I' ? '#27ae60' :
                                            item.nivel === 'Tipo II' ? '#f39c12' :
                                            item.nivel === 'Tipo III' ? '#e74c3c' : '#95a5a6'
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
        padding: '24px',
        maxWidth: '1000px',
        margin: '0 auto'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px'
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
        textAlign: 'center',
        padding: '50px'
    },
    retryButton: {
        padding: '8px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '15px'
    },
    welcomeSection: {
        marginBottom: '24px'
    },
    welcomeTitle: {
        margin: '0 0 8px 0',
        fontSize: '24px',
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
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
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '5px'
    },
    statLabel: {
        color: '#7f8c8d',
        fontSize: '13px'
    },
    sectionCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '20px',
        overflow: 'hidden'
    },
    sectionHeader: {
        padding: '16px 20px',
        borderBottom: '1px solid #ecf0f1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sectionTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '600',
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
        borderRadius: '4px'
    },
    emptyState: {
        padding: '40px',
        textAlign: 'center'
    },
    emptyIcon: {
        fontSize: '36px',
        opacity: 0.5,
        marginBottom: '8px',
        display: 'block'
    },
    emptySubtext: {
        fontSize: '13px',
        color: '#95a5a6',
        marginTop: '4px'
    },
    listContainer: {
        padding: '16px'
    },
    listItem: {
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        marginBottom: '8px',
        borderLeft: '3px solid #27ae60'
    },
    itemHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        flexWrap: 'wrap',
        gap: '8px'
    },
    itemCurso: {
        color: '#718096',
        fontSize: '12px',
        backgroundColor: '#e2e8f0',
        padding: '2px 8px',
        borderRadius: '20px'
    },
    itemDetails: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
    },
    itemDate: {
        fontSize: '12px',
        color: '#718096'
    },
    motivoBadge: {
        fontSize: '11px',
        color: '#718096',
        backgroundColor: '#edf2f7',
        padding: '2px 8px',
        borderRadius: '20px'
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '11px',
        fontWeight: '600'
    },
    tipoBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '11px',
        fontWeight: '600'
    },
    nivelBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '11px',
        fontWeight: '600'
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
// Frontend/src/Pages/AcudienteDashboard.jsx
import { useState, useEffect } from 'react';

const AcudienteDashboard = ({ user, onLogout }) => {
    const [hijos, setHijos] = useState([]);
    const [selectedHijo, setSelectedHijo] = useState(null);
    const [asistencias, setAsistencias] = useState([]);
    const [observaciones, setObservaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDatosAcudiente();
    }, []);

    const fetchDatosAcudiente = async () => {
        try {
            // Datos de ejemplo mientras conectamos con el backend
            setHijos([
                {
                    id: 1,
                    nombre: 'Juan Pérez López',
                    grado: '6A',
                    id_estudiante: '1063819482'
                },
                {
                    id: 2,
                    nombre: 'María Pérez López',
                    grado: '4B',
                    id_estudiante: '1063819483'
                }
            ]);

            setAsistencias([
                {
                    fecha: '2026-03-09',
                    estado: 'presente'
                },
                {
                    fecha: '2026-03-10',
                    estado: 'presente'
                },
                {
                    fecha: '2026-03-11',
                    estado: 'ausente',
                    motivo: 'Enfermedad'
                }
            ]);

            setObservaciones([
                {
                    fecha: '2026-03-10',
                    tipo: 'Académica',
                    descripcion: 'Buen desempeño en clase',
                    docente: 'SANDRA MARCELA CHITO CERON'
                },
                {
                    fecha: '2026-03-05',
                    tipo: 'Disciplinaria',
                    descripcion: 'Llamado de atención por comportamiento',
                    docente: 'NELLY SOCORRO HURADO'
                }
            ]);

            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <p>Cargando panel del acudiente...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Barra superior */}
            <div style={styles.topBar}>
                <h1 style={styles.title}>Orizon Cottage</h1>
                <p style={styles.subtitle}>Gestión de Convivencia</p>
                <div style={styles.userInfo}>
                    <span>👤 {user?.nombre} ({user?.rol})</span>
                    <button onClick={onLogout} style={styles.logoutButton}>
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Contenido principal */}
            <div style={styles.mainContent}>
                {/* Panel lateral */}
                <div style={styles.sidebar}>
                    <h3 style={styles.sidebarTitle}>Panel Principal</h3>
                    <ul style={styles.menuList}>
                        <li style={styles.menuItemActive}>📊 Dashboard</li>
                        <li style={styles.menuItem}>📋 Mis Hijos</li>
                        <li style={styles.menuItem}>📚 Historial</li>
                        <li style={styles.menuItem}>💬 Mensajería</li>
                    </ul>
                </div>

                {/* Contenido derecho */}
                <div style={styles.content}>
                    <h2 style={styles.welcomeTitle}>Panel Acudiente</h2>
                    <p style={styles.welcomeText}>
                        Bienvenido al sistema de gestión escolar. Aquí puedes dar seguimiento a tus hijos.
                    </p>

                    {/* Lista de hijos */}
                    <div style={styles.sectionCard}>
                        <h3 style={styles.sectionTitle}>Mis Hijos</h3>
                        <div style={styles.hijosGrid}>
                            {hijos.map(hijo => (
                                <div 
                                    key={hijo.id} 
                                    style={styles.hijoCard}
                                    onClick={() => setSelectedHijo(hijo)}
                                >
                                    <div style={styles.hijoIcon}>👤</div>
                                    <div style={styles.hijoInfo}>
                                        <strong>{hijo.nombre}</strong>
                                        <p>Grado: {hijo.grado}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Asistencia reciente */}
                    <div style={styles.sectionCard}>
                        <h3 style={styles.sectionTitle}>
                            Asistencia {selectedHijo ? `de ${selectedHijo.nombre}` : 'Reciente'}
                        </h3>
                        <div style={styles.asistenciaContainer}>
                            {asistencias.map((asis, index) => (
                                <div key={index} style={styles.asistenciaItem}>
                                    <span style={styles.asistenciaFecha}>
                                        {new Date(asis.fecha).toLocaleDateString()}
                                    </span>
                                    <span style={{
                                        ...styles.asistenciaEstado,
                                        backgroundColor: asis.estado === 'presente' ? '#27ae60' : 
                                                        asis.estado === 'ausente' ? '#e74c3c' : '#f39c12'
                                    }}>
                                        {asis.estado}
                                    </span>
                                    {asis.motivo && (
                                        <span style={styles.asistenciaMotivo}>
                                            {asis.motivo}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Observaciones recientes */}
                    <div style={styles.sectionCard}>
                        <h3 style={styles.sectionTitle}>Observaciones Recientes</h3>
                        <div style={styles.observacionesContainer}>
                            {observaciones.map((obs, index) => (
                                <div key={index} style={styles.observacionItem}>
                                    <div style={styles.observacionHeader}>
                                        <span style={styles.observacionFecha}>
                                            {new Date(obs.fecha).toLocaleDateString()}
                                        </span>
                                        <span style={{
                                            ...styles.observacionTipo,
                                            backgroundColor: obs.tipo === 'Académica' ? '#3498db' : '#e74c3c'
                                        }}>
                                            {obs.tipo}
                                        </span>
                                    </div>
                                    <p style={styles.observacionDesc}>{obs.descripcion}</p>
                                    <p style={styles.observacionDocente}>Docente: {obs.docente}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#2c3e50'
    },
    topBar: {
        backgroundColor: '#27ae60',
        color: 'white',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        margin: 0,
        fontSize: '20px'
    },
    subtitle: {
        margin: 0,
        fontSize: '14px',
        opacity: 0.9
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    logoutButton: {
        padding: '8px 15px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    mainContent: {
        display: 'flex',
        minHeight: 'calc(100vh - 70px)'
    },
    sidebar: {
        width: '250px',
        backgroundColor: 'white',
        padding: '20px',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
    },
    sidebarTitle: {
        margin: '0 0 20px 0',
        color: '#2c3e50',
        fontSize: '16px'
    },
    menuList: {
        listStyle: 'none',
        padding: 0,
        margin: 0
    },
    menuItem: {
        padding: '12px 15px',
        margin: '5px 0',
        borderRadius: '5px',
        cursor: 'pointer',
        color: '#7f8c8d',
        transition: 'all 0.3s'
    },
    menuItemActive: {
        padding: '12px 15px',
        margin: '5px 0',
        borderRadius: '5px',
        cursor: 'pointer',
        backgroundColor: '#27ae60',
        color: 'white'
    },
    content: {
        flex: 1,
        padding: '30px',
        overflowY: 'auto'
    },
    welcomeTitle: {
        margin: '0 0 5px 0',
        color: '#2c3e50',
        fontSize: '24px'
    },
    welcomeText: {
        margin: '0 0 30px 0',
        color: '#7f8c8d',
        fontSize: '14px'
    },
    sectionCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '20px',
        marginBottom: '30px'
    },
    sectionTitle: {
        margin: '0 0 20px 0',
        color: '#2c3e50',
        fontSize: '18px'
    },
    hijosGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px'
    },
    hijoCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        border: '2px solid transparent',
        ':hover': {
            transform: 'translateY(-2px)',
            borderColor: '#27ae60'
        }
    },
    hijoIcon: {
        fontSize: '30px'
    },
    hijoInfo: {
        flex: 1
    },
    asistenciaContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    asistenciaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px'
    },
    asistenciaFecha: {
        minWidth: '100px',
        color: '#2c3e50'
    },
    asistenciaEstado: {
        padding: '3px 10px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    asistenciaMotivo: {
        color: '#7f8c8d',
        fontSize: '13px'
    },
    observacionesContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    observacionItem: {
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px',
        borderLeft: '3px solid #27ae60'
    },
    observacionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    observacionFecha: {
        color: '#2c3e50',
        fontWeight: 'bold'
    },
    observacionTipo: {
        padding: '3px 10px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '11px',
        fontWeight: 'bold'
    },
    observacionDesc: {
        margin: '10px 0',
        color: '#2c3e50'
    },
    observacionDocente: {
        color: '#7f8c8d',
        fontSize: '12px',
        fontStyle: 'italic'
    }
};

export default AcudienteDashboard;
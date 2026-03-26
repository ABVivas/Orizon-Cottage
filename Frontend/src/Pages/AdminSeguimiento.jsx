// Frontend/src/Pages/AdminSeguimiento.jsx
import { useState, useEffect } from 'react';

const AdminSeguimiento = () => {
    // ===========================================
    // ESTADOS
    // ===========================================
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [stats, setStats] = useState({ total: 0, casosGraves: 0, totalInasistencias: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    // Filtros
    const [filters, setFilters] = useState({ 
        curso: 'todos', 
        nivel: 'todos', 
        tipo: 'todos', 
        fecha: '' 
    });
    
    // Opciones de filtros
    const gradosCompletos = ['todos', '0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
    const niveles = ['todos', 'Tipo I', 'Tipo II', 'Tipo III'];
    const tipos = ['todos', 'Académica', 'Disciplinaria', 'General'];

    // ===========================================
    // FUNCIONES AUXILIARES
    // ===========================================
    const formatGrado = (grado) => {
        if (!grado) return '';
        if (grado.includes('°')) return grado;
        const gradoMap = { 
            'preescolar': '0°', 
            'primero': '1°', 
            'segundo': '2°', 
            'tercero': '3°',
            'cuarto': '4°', 
            'quinto': '5°', 
            'sexto': '6°', 
            'septimo': '7°',
            'octavo': '8°', 
            'noveno': '9°', 
            'decimo': '10°', 
            'once': '11°'
        };
        return gradoMap[grado.toLowerCase()] || grado;
    };

    const capitalizeWords = (str) => {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    const getNivelColor = (nivel) => {
        switch(nivel) { 
            case 'Tipo I': return '#27ae60'; 
            case 'Tipo II': return '#f39c12'; 
            case 'Tipo III': return '#e74c3c'; 
            default: return '#95a5a6'; 
        }
    };

    const getTipoColor = (tipo) => {
        switch(tipo) { 
            case 'Académica': return '#3498db'; 
            case 'Disciplinaria': return '#e74c3c'; 
            case 'General': return '#9b59b6'; 
            default: return '#95a5a6'; 
        }
    };

    // ===========================================
    // CALCULAR ESTADÍSTICAS
    // ===========================================
    const calculateStats = (filteredData) => {
        const total = filteredData.length;
        
        // Contar casos graves (Tipo II y Tipo III)
        const casosGraves = filteredData.filter(item => 
            item.nivel === 'Tipo II' || item.nivel === 'Tipo III'
        ).length;
        
        // Sumar todas las inasistencias
        const totalInasistencias = filteredData.reduce((sum, item) => sum + (item.inasistencias || 0), 0);
        
        setStats({ total, casosGraves, totalInasistencias });
    };

    // ===========================================
    // FETCH DATA
    // ===========================================
    useEffect(() => { 
        fetchData(); 
    }, []);

    useEffect(() => { 
        applyFilters(); 
    }, [filters, data]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/seguimiento', { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const result = await response.json();
            
            if (result.success) {
                const formattedData = result.data.map(item => ({ 
                    ...item, 
                    estudiante: capitalizeWords(item.estudiante), 
                    curso: formatGrado(item.curso), 
                    nivel: item.nivel || 'N/A',
                    tipo: item.tipo || 'General'
                }));
                setData(formattedData);
            }
        } catch (error) { 
            setError(error.message); 
        } finally { 
            setLoading(false); 
        }
    };

    // ===========================================
    // FILTROS
    // ===========================================
    const applyFilters = () => {
        let filtered = [...data];
        
        if (filters.curso !== 'todos') {
            filtered = filtered.filter(item => item.curso === filters.curso);
        }
        if (filters.nivel !== 'todos') {
            filtered = filtered.filter(item => item.nivel === filters.nivel);
        }
        if (filters.tipo !== 'todos') {
            filtered = filtered.filter(item => item.tipo === filters.tipo);
        }
        if (filters.fecha) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.fecha).toISOString().split('T')[0];
                return itemDate === filters.fecha;
            });
        }
        
        setFilteredData(filtered);
        calculateStats(filtered);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // ===========================================
    // VER DETALLE
    // ===========================================
    const verDetalle = (item) => {
        setSelectedStudent(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedStudent(null);
    };

    // ===========================================
    // RENDER
    // ===========================================
    if (loading) {
        return (
            <div style={styles.container}>
                <h2 style={styles.title}>Seguimiento General</h2>
                <p>Cargando datos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <h2 style={styles.title}>Seguimiento General</h2>
                <div style={styles.error}>
                    <p>Error: {error}</p>
                    <button onClick={fetchData} style={styles.retryButton}>Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <h2 style={styles.title}>Seguimiento General</h2>
                <p style={styles.subtitle}>Monitoreo de observaciones y correctivos</p>
            </div>

            {/* FILTROS */}
            <div style={styles.filtersContainer}>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Curso</label>
                    <select 
                        value={filters.curso} 
                        onChange={(e) => handleFilterChange('curso', e.target.value)} 
                        style={styles.filterSelect}
                    >
                        {gradosCompletos.map(grado => (
                            <option key={grado} value={grado}>
                                {grado === 'todos' ? 'Todos los cursos' : grado}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Nivel de Gravedad</label>
                    <select 
                        value={filters.nivel} 
                        onChange={(e) => handleFilterChange('nivel', e.target.value)} 
                        style={styles.filterSelect}
                    >
                        {niveles.map(nivel => (
                            <option key={nivel} value={nivel}>
                                {nivel === 'todos' ? 'Todos los niveles' : nivel}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Tipo de Observación</label>
                    <select 
                        value={filters.tipo} 
                        onChange={(e) => handleFilterChange('tipo', e.target.value)} 
                        style={styles.filterSelect}
                    >
                        {tipos.map(tipo => (
                            <option key={tipo} value={tipo}>
                                {tipo === 'todos' ? 'Todos los tipos' : tipo}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Fecha</label>
                    <input 
                        type="date" 
                        value={filters.fecha} 
                        onChange={(e) => handleFilterChange('fecha', e.target.value)} 
                        style={styles.filterInput} 
                    />
                </div>
            </div>

            {/* TABLA */}
            <div style={styles.tableContainer}>
                <h3 style={styles.tableTitle}>Estudiantes con Observaciones</h3>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Estudiante</th>
                            <th style={styles.th}>Curso</th>
                            <th style={styles.th}>Observaciones</th>
                            <th style={styles.th}>Inasistencias</th>
                            <th style={styles.th}>Tipo</th>
                            <th style={styles.th}>Nivel</th>
                            <th style={styles.th}>Última Observación</th>
                            <th style={styles.th}>Acciones</th>
                          </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, idx) => (
                                <tr key={item._id || idx} style={styles.tr}>
                                    <td style={styles.td}>
                                        <strong>{item.estudiante}</strong>
                                    </td>
                                    <td style={styles.td}>{item.curso}</td>
                                    <td style={styles.td}>
                                        <span style={styles.badge}>{item.observaciones}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.badge}>{item.inasistencias}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.tipoBadge,
                                            backgroundColor: getTipoColor(item.tipo)
                                        }}>
                                            {item.tipo}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.nivelBadge,
                                            backgroundColor: getNivelColor(item.nivel)
                                        }}>
                                            {item.nivel}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{formatDate(item.fecha)}</td>
                                    <td style={styles.td}>
                                        <button 
                                            style={styles.actionButton}
                                            onClick={() => verDetalle(item)}
                                        >
                                            Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={styles.emptyMessage}>
                                    No hay estudiantes con observaciones para los filtros seleccionados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ESTADÍSTICAS */}
            <div style={styles.statsContainer}>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.total}</span>
                    <span style={styles.statLabel}>Total con observaciones</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.casosGraves}</span>
                    <span style={styles.statLabel}>Casos Tipo II y III</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.totalInasistencias}</span>
                    <span style={styles.statLabel}>Total inasistencias</span>
                </div>
            </div>

            {/* MODAL VER DETALLE */}
            {showModal && selectedStudent && (
                <div style={styles.modalOverlay} onClick={closeModal}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Detalle del Estudiante</h3>
                            <button style={styles.modalClose} onClick={closeModal}>×</button>
                        </div>
                        <div style={styles.modalContent}>
                            <p><strong>Nombre:</strong> {selectedStudent.estudiante}</p>
                            <p><strong>Curso:</strong> {selectedStudent.curso}</p>
                            <p><strong>Observaciones:</strong> {selectedStudent.observaciones}</p>
                            <p><strong>Inasistencias:</strong> {selectedStudent.inasistencias}</p>
                            <p><strong>Última observación:</strong> {formatDate(selectedStudent.fecha)}</p>
                            {selectedStudent.descripcion && (
                                <p><strong>Descripción:</strong> {selectedStudent.descripcion}</p>
                            )}
                            {selectedStudent.planMejora && (
                                <p><strong>Plan de Mejora:</strong> {selectedStudent.planMejora}</p>
                            )}
                        </div>
                        <div style={styles.modalFooter}>
                            <button style={styles.modalButton} onClick={closeModal}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ===========================================
// ESTILOS
// ===========================================
const styles = {
    container: { 
        padding: '20px', 
        maxWidth: '1400px', 
        margin: '0 auto' 
    },
    header: { 
        marginBottom: '30px' 
    },
    title: { 
        margin: '0 0 5px 0', 
        color: '#2c3e50', 
        fontSize: '24px', 
        fontWeight: '600' 
    },
    subtitle: { 
        margin: 0, 
        color: '#7f8c8d', 
        fontSize: '14px' 
    },
    error: { 
        padding: '20px', 
        backgroundColor: '#f8d7da', 
        color: '#721c24', 
        borderRadius: '5px', 
        textAlign: 'center' 
    },
    retryButton: { 
        padding: '10px 20px', 
        backgroundColor: '#27ae60', 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer', 
        marginTop: '10px' 
    },
    filtersContainer: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px', 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
    },
    filterGroup: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '5px' 
    },
    filterLabel: { 
        fontWeight: 'bold', 
        color: '#2c3e50', 
        fontSize: '13px' 
    },
    filterSelect: { 
        padding: '10px', 
        border: '1px solid #bdc3c7', 
        borderRadius: '5px', 
        fontSize: '14px', 
        backgroundColor: 'white' 
    },
    filterInput: { 
        padding: '10px', 
        border: '1px solid #bdc3c7', 
        borderRadius: '5px', 
        fontSize: '14px' 
    },
    tableContainer: { 
        backgroundColor: 'white', 
        borderRadius: '10px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
        padding: '20px', 
        marginBottom: '30px', 
        overflowX: 'auto' 
    },
    tableTitle: { 
        margin: '0 0 20px 0', 
        color: '#2c3e50', 
        fontSize: '18px', 
        fontWeight: '600' 
    },
    table: { 
        width: '100%', 
        borderCollapse: 'collapse' 
    },
    tableHeader: { 
        backgroundColor: '#f8f9fa', 
        borderBottom: '2px solid #27ae60' 
    },
    th: { 
        padding: '15px', 
        textAlign: 'left', 
        color: '#2c3e50', 
        fontSize: '14px', 
        fontWeight: 'bold' 
    },
    tr: { 
        borderBottom: '1px solid #ecf0f1' 
    },
    td: { 
        padding: '12px 15px', 
        fontSize: '14px' 
    },
    badge: { 
        backgroundColor: '#27ae60', 
        color: 'white', 
        padding: '4px 8px', 
        borderRadius: '12px', 
        fontSize: '12px', 
        fontWeight: 'bold', 
        display: 'inline-block' 
    },
    tipoBadge: { 
        padding: '4px 10px', 
        borderRadius: '20px', 
        color: 'white', 
        fontSize: '12px', 
        fontWeight: 'bold', 
        display: 'inline-block' 
    },
    nivelBadge: { 
        padding: '4px 10px', 
        borderRadius: '20px', 
        color: 'white', 
        fontSize: '12px', 
        fontWeight: 'bold', 
        display: 'inline-block' 
    },
    actionButton: { 
        padding: '6px 12px', 
        border: 'none', 
        borderRadius: '3px', 
        backgroundColor: '#3498db', 
        color: 'white', 
        cursor: 'pointer', 
        fontSize: '12px' 
    },
    emptyMessage: { 
        textAlign: 'center', 
        padding: '40px', 
        color: '#95a5a6' 
    },
    statsContainer: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
    },
    statCard: { 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
        textAlign: 'center' 
    },
    statValue: { 
        display: 'block', 
        fontSize: '28px', 
        fontWeight: 'bold', 
        color: '#2c3e50', 
        marginBottom: '5px' 
    },
    statLabel: { 
        color: '#7f8c8d', 
        fontSize: '14px' 
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #ecf0f1',
        backgroundColor: '#f8f9fa'
    },
    modalTitle: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    modalClose: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#7f8c8d'
    },
    modalContent: {
        padding: '20px',
        overflowY: 'auto'
    },
    modalFooter: {
        padding: '16px 20px',
        borderTop: '1px solid #ecf0f1',
        textAlign: 'right'
    },
    modalButton: {
        padding: '8px 16px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    }
};

export default AdminSeguimiento;
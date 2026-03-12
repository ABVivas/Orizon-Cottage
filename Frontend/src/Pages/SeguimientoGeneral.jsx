// Frontend/src/Pages/SeguimientoGeneral.jsx
// Frontend/src/Pages/SeguimientoGeneral.jsx
import { useState, useEffect } from 'react';

const SeguimientoGeneral = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        casosGraves: 0,
        totalInasistencias: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        curso: 'todos',
        nivel: 'todos',
        tipo: 'todos',
        fecha: ''
    });

    // Obtener cursos únicos para el filtro
    const [cursos, setCursos] = useState(['todos']);
    const niveles = ['todos', 'Leve', 'Medio', 'Grave', 'Tipo 1', 'Tipo 2', 'Tipo 3'];
    const tipos = ['todos', 'Académica', 'Disciplinaria', 'General'];

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
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('📊 Datos de seguimiento:', result);

            if (result.success) {
                setData(result.data);
                setStats(result.stats);
                
                // Extraer cursos únicos
                const uniqueCursos = ['todos', ...new Set(result.data.map(d => d.curso).filter(Boolean))];
                setCursos(uniqueCursos);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...data];
        
        if (filters.curso && filters.curso !== 'todos') {
            filtered = filtered.filter(item => item.curso === filters.curso);
        }
        
        if (filters.nivel && filters.nivel !== 'todos') {
            filtered = filtered.filter(item => 
                item.nivel?.toLowerCase() === filters.nivel.toLowerCase()
            );
        }
        
        if (filters.tipo && filters.tipo !== 'todos') {
            filtered = filtered.filter(item => 
                item.tipo?.toLowerCase() === filters.tipo.toLowerCase()
            );
        }
        
        if (filters.fecha) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.fecha).toISOString().split('T')[0];
                return itemDate === filters.fecha;
            });
        }
        
        setFilteredData(filtered);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const verDetalle = (estudiante) => {
        alert(`Ver detalle de ${estudiante.estudiante}`);
        // Aquí puedes navegar a una página de detalle
    };

    const generarPlan = (estudiante) => {
        alert(`Generar plan de mejora para ${estudiante.estudiante}`);
        // Aquí puedes abrir un modal para crear plan
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

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
                    <button onClick={fetchData} style={styles.retryButton}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Seguimiento General</h2>
                <p style={styles.subtitle}>Monitoreo de observaciones y correctivos</p>
            </div>

            {/* Filtros */}
            <div style={styles.filtersContainer}>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Curso</label>
                    <select 
                        value={filters.curso}
                        onChange={(e) => handleFilterChange('curso', e.target.value)}
                        style={styles.filterSelect}
                    >
                        {cursos.map(curso => (
                            <option key={curso} value={curso}>
                                {curso === 'todos' ? 'Todos los cursos' : curso}
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
                    <label style={styles.filterLabel}>Tipo</label>
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

            {/* Tabla de estudiantes con observaciones */}
            <div style={styles.tableContainer}>
                <h3 style={styles.tableTitle}>Estudiantes con Observaciones</h3>
                
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Estudiante</th>
                            <th style={styles.th}>Curso</th>
                            <th style={styles.th}>Observaciones</th>
                            <th style={styles.th}>Inasistencias</th>
                            <th style={styles.th}>Nivel</th>
                            <th style={styles.th}>Última Observación</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <tr key={item._id || index} style={styles.tr}>
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
                                            ...styles.nivelBadge,
                                            backgroundColor: 
                                                item.nivel === 'Leve' || item.nivel === 'Tipo 1' ? '#27ae60' :
                                                item.nivel === 'Medio' || item.nivel === 'Tipo 2' ? '#f39c12' :
                                                item.nivel === 'Grave' || item.nivel === 'Tipo 3' ? '#e74c3c' : '#95a5a6'
                                        }}>
                                            {item.nivel}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {formatDate(item.fecha)}
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            style={styles.actionButton}
                                            onClick={() => verDetalle(item)}
                                        >
                                            Ver Detalle
                                        </button>
                                        <button 
                                            style={styles.planButton}
                                            onClick={() => generarPlan(item)}
                                        >
                                            Generar Plan
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={styles.emptyMessage}>
                                    No hay estudiantes con observaciones para los filtros seleccionados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Resumen estadístico */}
            <div style={styles.statsContainer}>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.total}</span>
                    <span style={styles.statLabel}>Total con observaciones</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.casosGraves}</span>
                    <span style={styles.statLabel}>Casos graves</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.totalInasistencias}</span>
                    <span style={styles.statLabel}>Total inasistencias</span>
                </div>
            </div>
        </div>
    );
};

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
        fontSize: '24px'
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
        marginBottom: '30px'
    },
    tableTitle: {
        margin: '0 0 20px 0',
        color: '#2c3e50',
        fontSize: '18px'
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
        marginRight: '5px',
        border: 'none',
        borderRadius: '3px',
        backgroundColor: '#3498db',
        color: 'white',
        cursor: 'pointer',
        fontSize: '12px'
    },
    planButton: {
        padding: '6px 12px',
        border: 'none',
        borderRadius: '3px',
        backgroundColor: '#27ae60',
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
        gap: '20px'
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
    }
};

export default SeguimientoGeneral;
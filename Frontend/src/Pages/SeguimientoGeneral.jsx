// Frontend/src/Pages/SeguimientoGeneral.jsx
import { useState, useEffect } from 'react';

const SeguimientoGeneral = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        curso: 'todos',
        nivel: 'todos',
        tipo: 'todos',
        fecha: ''
    });

    // Datos de ejemplo (luego se conectará al backend)
    const [observations, setObservations] = useState([
        {
            id: 1,
            estudiante: 'Juan Pérez López',
            curso: '6A',
            observaciones: 3,
            inasistencias: 5,
            nivel: 'Tipo 2',
            ultimaObservacion: '2025-10-01',
            tipo: 'Disciplinaria'
        },
        {
            id: 2,
            estudiante: 'María González García',
            curso: '7B',
            observaciones: 1,
            inasistencias: 2,
            nivel: 'Tipo 1',
            ultimaObservacion: '2025-09-28',
            tipo: 'Académica'
        },
        {
            id: 3,
            estudiante: 'Carlos Rodríguez Silva',
            curso: '8A',
            observaciones: 5,
            inasistencias: 8,
            nivel: 'Tipo 3',
            ultimaObservacion: '2025-10-02',
            tipo: 'Disciplinaria'
        },
        {
            id: 4,
            estudiante: 'Ana Martínez López',
            curso: '6A',
            observaciones: 2,
            inasistencias: 3,
            nivel: 'Tipo 2',
            ultimaObservacion: '2025-09-30',
            tipo: 'Académica'
        }
    ]);

    // Obtener cursos únicos para el filtro
    const cursos = ['todos', ...new Set(observations.map(o => o.curso))];
    const niveles = ['todos', 'Tipo 1', 'Tipo 2', 'Tipo 3'];
    const tipos = ['todos', 'Académica', 'Disciplinaria'];

    useEffect(() => {
        applyFilters();
    }, [filters, observations]);

    const applyFilters = () => {
        let filtered = [...observations];
        
        if (filters.curso !== 'todos') {
            filtered = filtered.filter(o => o.curso === filters.curso);
        }
        if (filters.nivel !== 'todos') {
            filtered = filtered.filter(o => o.nivel === filters.nivel);
        }
        if (filters.tipo !== 'todos') {
            filtered = filtered.filter(o => o.tipo === filters.tipo);
        }
        if (filters.fecha) {
            filtered = filtered.filter(o => o.ultimaObservacion === filters.fecha);
        }
        
        setFilteredStudents(filtered);
    };

    const handleFilterChange = (key, value) => {
        setFilters({...filters, [key]: value});
    };

    const verDetalle = (estudiante) => {
        alert(`Ver detalle de ${estudiante.estudiante}`);
    };

    const generarPlan = (estudiante) => {
        alert(`Generar plan de mejora para ${estudiante.estudiante}`);
    };

    return (
        <div>
            {/* Header */}
            <div style={styles.header}>
                <h2 style={styles.title}>Seguimiento General</h2>
                <p style={styles.subtitle}>Monitoreo de observaciones y correctivos</p>
            </div>

            {/* Filtros de búsqueda */}
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
                        placeholder="dd/mm/aaaa"
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
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <strong>{student.estudiante}</strong>
                                    </td>
                                    <td style={styles.td}>{student.curso}</td>
                                    <td style={styles.td}>
                                        <span style={styles.badge}>{student.observaciones}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.badge}>{student.inasistencias}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.nivelBadge,
                                            backgroundColor: student.nivel === 'Tipo 1' ? '#27ae60' :
                                                             student.nivel === 'Tipo 2' ? '#f39c12' : '#e74c3c'
                                        }}>
                                            {student.nivel}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {new Date(student.ultimaObservacion).toLocaleDateString()}
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            style={styles.actionButton}
                                            onClick={() => verDetalle(student)}
                                        >
                                            Ver Detalle
                                        </button>
                                        <button 
                                            style={styles.planButton}
                                            onClick={() => generarPlan(student)}
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

            {/* Resumen rápido */}
            <div style={styles.summaryContainer}>
                <div style={styles.summaryCard}>
                    <span style={styles.summaryValue}>{observations.length}</span>
                    <span style={styles.summaryLabel}>Total con observaciones</span>
                </div>
                <div style={styles.summaryCard}>
                    <span style={styles.summaryValue}>
                        {observations.filter(o => o.nivel === 'Tipo 3').length}
                    </span>
                    <span style={styles.summaryLabel}>Casos graves</span>
                </div>
                <div style={styles.summaryCard}>
                    <span style={styles.summaryValue}>
                        {observations.reduce((sum, o) => sum + o.inasistencias, 0)}
                    </span>
                    <span style={styles.summaryLabel}>Total inasistencias</span>
                </div>
            </div>
        </div>
    );
};

const styles = {
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
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
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
        padding: '5px 10px',
        marginRight: '5px',
        border: 'none',
        borderRadius: '3px',
        backgroundColor: '#3498db',
        color: 'white',
        cursor: 'pointer',
        fontSize: '12px'
    },
    planButton: {
        padding: '5px 10px',
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
    summaryContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
    },
    summaryCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    summaryValue: {
        display: 'block',
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '5px'
    },
    summaryLabel: {
        color: '#7f8c8d',
        fontSize: '14px'
    }
};

export default SeguimientoGeneral;
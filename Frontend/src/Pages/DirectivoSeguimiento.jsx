// Frontend/src/Pages/DirectivoSeguimiento.jsx
import { useState } from 'react';

const DirectivoSeguimiento = () => {
    const [filters, setFilters] = useState({
        curso: 'todos',
        nivel: 'todos',
        tipo: 'todos',
        fecha: ''
    });

    const [estudiantes] = useState([
        { nombre: 'Juan Pérez López', curso: '6A', observaciones: 3, inasistencias: 5, nivel: 'Tipo 2', ultimaObs: '2025-10-01' },
        { nombre: 'María González García', curso: '7B', observaciones: 1, inasistencias: 2, nivel: 'Tipo 1', ultimaObs: '2025-09-28' },
        { nombre: 'Carlos Rodríguez Silva', curso: '8A', observaciones: 5, inasistencias: 8, nivel: 'Tipo 3', ultimaObs: '2025-10-02' }
    ]);

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Seguimiento General</h2>
            <p style={styles.pageSubtitle}>Monitoreo de observaciones y correctivos</p>

            {/* Filtros */}
            <div style={styles.filtersCard}>
                <div style={styles.filtersGrid}>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Curso</label>
                        <select style={styles.filterSelect} value={filters.curso} onChange={(e) => setFilters({...filters, curso: e.target.value})}>
                            <option value="todos">Todos los cursos</option>
                            <option value="6A">6A</option>
                            <option value="7B">7B</option>
                            <option value="8A">8A</option>
                        </select>
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Nivel de Gravedad</label>
                        <select style={styles.filterSelect} value={filters.nivel} onChange={(e) => setFilters({...filters, nivel: e.target.value})}>
                            <option value="todos">Todos los niveles</option>
                            <option value="Tipo 1">Tipo 1</option>
                            <option value="Tipo 2">Tipo 2</option>
                            <option value="Tipo 3">Tipo 3</option>
                        </select>
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Tipo</label>
                        <select style={styles.filterSelect} value={filters.tipo} onChange={(e) => setFilters({...filters, tipo: e.target.value})}>
                            <option value="todos">Todos los tipos</option>
                            <option value="Académica">Académica</option>
                            <option value="Disciplinaria">Disciplinaria</option>
                        </select>
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Fecha</label>
                        <input type="date" style={styles.filterInput} value={filters.fecha} onChange={(e) => setFilters({...filters, fecha: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div style={styles.tableCard}>
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
                        {estudiantes.map((est, index) => (
                            <tr key={index} style={styles.tr}>
                                <td style={styles.td}><strong>{est.nombre}</strong></td>
                                <td style={styles.td}>{est.curso}</td>
                                <td style={styles.td}>{est.observaciones}</td>
                                <td style={styles.td}>{est.inasistencias}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.nivelBadge,
                                        backgroundColor: est.nivel === 'Tipo 1' ? '#27ae60' : est.nivel === 'Tipo 2' ? '#f39c12' : '#e74c3c'
                                    }}>{est.nivel}</span>
                                </td>
                                <td style={styles.td}>{est.ultimaObs}</td>
                                <td style={styles.td}>
                                    <button style={styles.actionButton}>Ver Detalle</button>
                                    <button style={styles.planButton}>Generar Plan</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px' },
    pageTitle: { margin: '0 0 5px 0', fontSize: '24px', color: '#2c3e50' },
    pageSubtitle: { margin: '0 0 25px 0', fontSize: '14px', color: '#7f8c8d' },
    filtersCard: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '20px', marginBottom: '20px' },
    filtersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    filterLabel: { fontWeight: '500', color: '#2c3e50', fontSize: '13px' },
    filterSelect: { padding: '10px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px' },
    filterInput: { padding: '10px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px' },
    tableCard: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #27ae60' },
    th: { padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2c3e50' },
    tr: { borderBottom: '1px solid #ecf0f1' },
    td: { padding: '12px 15px', fontSize: '14px' },
    nivelBadge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px', display: 'inline-block' },
    actionButton: { padding: '6px 12px', marginRight: '5px', border: 'none', borderRadius: '4px', backgroundColor: '#3498db', color: 'white', cursor: 'pointer', fontSize: '12px' },
    planButton: { padding: '6px 12px', border: 'none', borderRadius: '4px', backgroundColor: '#27ae60', color: 'white', cursor: 'pointer', fontSize: '12px' }
};

export default DirectivoSeguimiento;
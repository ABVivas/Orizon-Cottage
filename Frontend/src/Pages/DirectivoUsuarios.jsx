// Frontend/src/Pages/DirectivoUsuarios.jsx
import { useState } from 'react';

const DirectivoUsuarios = () => {
    const [filters, setFilters] = useState({
        rol: 'todos',
        estado: 'todos',
        busqueda: ''
    });

    const [usuarios] = useState([
        { nombre: 'María García', rol: 'Docente', asignacion: '6A, 7A', estado: 'Activo' },
        { nombre: 'Carlos López', rol: 'Docente', asignacion: '8A, 9A', estado: 'Activo' },
        { nombre: 'Ana Martínez', rol: 'Acudiente', asignacion: 'Juan Pérez López', estado: 'Activo' },
        { nombre: 'Luis Rodríguez', rol: 'Acudiente', asignacion: 'Carlos Rodríguez Silva', estado: 'Inactivo' }
    ]);

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Gestión de Usuarios</h2>
            <p style={styles.pageSubtitle}>Administre usuarios y roles del sistema</p>

            {/* Filtros */}
            <div style={styles.filtersCard}>
                <div style={styles.filtersGrid}>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Rol</label>
                        <select style={styles.filterSelect} value={filters.rol} onChange={(e) => setFilters({...filters, rol: e.target.value})}>
                            <option value="todos">Todos los roles</option>
                            <option value="docente">Docente</option>
                            <option value="acudiente">Acudiente</option>
                            <option value="directivo">Directivo</option>
                        </select>
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Estado</label>
                        <select style={styles.filterSelect} value={filters.estado} onChange={(e) => setFilters({...filters, estado: e.target.value})}>
                            <option value="todos">Todos los estados</option>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Buscar</label>
                        <input type="text" style={styles.filterInput} placeholder="Buscar por nombre..." value={filters.busqueda} onChange={(e) => setFilters({...filters, busqueda: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Nombre</th>
                            <th style={styles.th}>Rol</th>
                            <th style={styles.th}>Asignación</th>
                            <th style={styles.th}>Estado</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((user, index) => (
                            <tr key={index} style={styles.tr}>
                                <td style={styles.td}>{user.nombre}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.roleBadge,
                                        backgroundColor: user.rol === 'Docente' ? '#3498db' : user.rol === 'Acudiente' ? '#27ae60' : '#9b59b6'
                                    }}>{user.rol}</span>
                                </td>
                                <td style={styles.td}>{user.asignacion}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.estadoBadge,
                                        backgroundColor: user.estado === 'Activo' ? '#27ae60' : '#e74c3c'
                                    }}>{user.estado}</span>
                                </td>
                                <td style={styles.td}>
                                    <button style={styles.editButton}>✏️</button>
                                    <button style={styles.deleteButton}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button style={styles.newUserButton}>+ Nuevo Usuario</button>
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
    tableCard: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '20px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #27ae60' },
    th: { padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#2c3e50' },
    tr: { borderBottom: '1px solid #ecf0f1' },
    td: { padding: '12px 15px', fontSize: '14px' },
    roleBadge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px', display: 'inline-block' },
    estadoBadge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px', display: 'inline-block' },
    editButton: { padding: '5px 10px', marginRight: '5px', border: 'none', borderRadius: '4px', backgroundColor: '#f39c12', color: 'white', cursor: 'pointer' },
    deleteButton: { padding: '5px 10px', border: 'none', borderRadius: '4px', backgroundColor: '#e74c3c', color: 'white', cursor: 'pointer' },
    newUserButton: { padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};

export default DirectivoUsuarios;
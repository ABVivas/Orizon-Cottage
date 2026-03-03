// Frontend/src/Pages/UserManagement.jsx
import { useState, useEffect } from 'react';
import UserList from './UserList';
import StudentList from './studentList';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [filteredData, setFilteredData] = useState({
        estudiantes: [],
        acudientes: [],
        docentes: [],
        directivos: [],
        admins: []
    });
    const [loading, setLoading] = useState(false);
    
    const [filters, setFilters] = useState({
        rol: 'todos',
        estado: 'todos',
        search: ''
    });

    // Estadísticas por rol
    const [stats, setStats] = useState({
        total: 0,
        acudientes: 0,
        docentes: 0,
        directivos: 0,
        admins: 0,
        activos: 0,
        inactivos: 0
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        applyFilters();
        calculateStats();
    }, [users, filters]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const stats = {
            total: users.length,
            acudientes: users.filter(u => u.rol === 'acudiente').length,
            docentes: users.filter(u => u.rol === 'docente').length,
            directivos: users.filter(u => u.rol === 'directivo').length,
            admins: users.filter(u => u.rol === 'admin').length,
            activos: users.filter(u => u.activo).length,
            inactivos: users.filter(u => !u.activo).length
        };
        setStats(stats);
    };

    const applyFilters = () => {
        let filtered = [...users];
        
        // Filtrar por rol
        if (filters.rol !== 'todos') {
            filtered = filtered.filter(u => u.rol === filters.rol);
        }
        
        // Filtrar por estado
        if (filters.estado !== 'todos') {
            const isActive = filters.estado === 'activo';
            filtered = filtered.filter(u => u.activo === isActive);
        }
        
        // Filtrar por búsqueda
        if (filters.search) {
            const term = filters.search.toLowerCase();
            filtered = filtered.filter(u => 
                u.nombre?.toLowerCase().includes(term) ||
                u.numeroIdentificacion?.includes(term) ||
                u.email?.toLowerCase().includes(term)
            );
        }
        
        setFilteredUsers(filtered);
    };

    const handleFilterChange = (key, value) => {
        setFilters({...filters, [key]: value});
    };

    const handleCreateUser = () => {
        // Abrir modal para crear usuario según el rol seleccionado
        alert(`Crear nuevo ${filters.rol === 'todos' ? 'usuario' : filters.rol}`);
    };

    return (
        <div>
            {/* Header con título y botón de nuevo usuario */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Gestión de Usuarios</h2>
                    <p style={styles.subtitle}>Administre usuarios y roles del sistema</p>
                </div>
                <button style={styles.addButton} onClick={handleCreateUser}>
                    + Nuevo Usuario
                </button>
            </div>

            {/* Tarjetas de estadísticas */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{stats.total}</span>
                    <span style={styles.statLabel}>Total Usuarios</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#27ae60'}}>
                    <span style={styles.statValue}>{stats.activos}</span>
                    <span style={styles.statLabel}>Activos</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#e74c3c'}}>
                    <span style={styles.statValue}>{stats.inactivos}</span>
                    <span style={styles.statLabel}>Inactivos</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#3498db'}}>
                    <span style={styles.statValue}>{stats.docentes}</span>
                    <span style={styles.statLabel}>Docentes</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#f39c12'}}>
                    <span style={styles.statValue}>{stats.acudientes}</span>
                    <span style={styles.statLabel}>Acudientes</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#9b59b6'}}>
                    <span style={styles.statValue}>{stats.directivos + stats.admins}</span>
                    <span style={styles.statLabel}>Administrativos</span>
                </div>
            </div>

            {/* Filtros */}
            <div style={styles.filtersContainer}>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Rol</label>
                    <select 
                        value={filters.rol}
                        onChange={(e) => handleFilterChange('rol', e.target.value)}
                        style={styles.filterSelect}
                    >
                        <option value="todos">Todos los roles</option>
                        <option value="acudiente">Acudientes</option>
                        <option value="docente">Docentes</option>
                        <option value="directivo">Directivos</option>
                        <option value="admin">Administradores</option>
                    </select>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Estado</label>
                    <select 
                        value={filters.estado}
                        onChange={(e) => handleFilterChange('estado', e.target.value)}
                        style={styles.filterSelect}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Buscar</label>
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        placeholder="Buscar por nombre, ID o email..."
                        style={styles.filterInput}
                    />
                </div>
            </div>

            {/* Lista de usuarios por rol */}
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div>
                    {/* Mostrar diferentes secciones según el filtro */}
                    {filters.rol === 'todos' ? (
                        // Mostrar todos los roles agrupados
                        <>
                            {stats.docentes > 0 && (
                                <UserList 
                                    users={filteredUsers.filter(u => u.rol === 'docente')}
                                    title="Docentes"
                                    rol="docente"
                                    onUserUpdate={fetchUsers}
                                />
                            )}
                            {stats.acudientes > 0 && (
                                <UserList 
                                    users={filteredUsers.filter(u => u.rol === 'acudiente')}
                                    title="Acudientes"
                                    rol="acudiente"
                                    onUserUpdate={fetchUsers}
                                />
                            )}
                            {stats.directivos > 0 && (
                                <UserList 
                                    users={filteredUsers.filter(u => u.rol === 'directivo')}
                                    title="Directivos"
                                    rol="directivo"
                                    onUserUpdate={fetchUsers}
                                />
                            )}
                            {stats.admins > 0 && (
                                <UserList 
                                    users={filteredUsers.filter(u => u.rol === 'admin')}
                                    title="Administradores"
                                    rol="admin"
                                    onUserUpdate={fetchUsers}
                                />
                            )}
                        </>
                    ) : (
                        // Mostrar solo el rol seleccionado
                        <UserList 
                            users={filteredUsers}
                            title={filters.rol === 'acudiente' ? 'Acudientes' :
                                  filters.rol === 'docente' ? 'Docentes' :
                                  filters.rol === 'directivo' ? 'Directivos' : 'Administradores'}
                            rol={filters.rol}
                            onUserUpdate={fetchUsers}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    addButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
    },
    statCard: {
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    statValue: {
        display: 'block',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '5px'
    },
    statLabel: {
        fontSize: '12px',
        opacity: 0.9
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
    }
};

export default UserManagement;
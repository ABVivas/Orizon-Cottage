// Frontend/src/Pages/UserManagement.jsx
import { useState, useEffect } from 'react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        rol: 'todos',
        estado: 'todos',
        search: ''
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        numerodeidentificacion: '',
        rol: 'acudiente',
        password: '',
        estudiantesAsociados: [],
        cursosAsignados: []
    });
    const [students, setStudents] = useState([]);

    // Cargar usuarios y estudiantes
    useEffect(() => {
        fetchUsers();
        fetchStudents();
        
        // Agregar estilos CSS
        const style = document.createElement('style');
        style.textContent = `
            .user-table tr:hover {
                background-color: #f0f9f0 !important;
            }
            .status-badge {
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
            }
            .status-active {
                background-color: #d4edda;
                color: #155724;
            }
            .status-inactive {
                background-color: #f8d7da;
                color: #721c24;
            }
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
        `;
        document.head.appendChild(style);
    }, []);

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
                applyFilters(data.users, filters);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/students', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStudents(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const applyFilters = (userList, currentFilters) => {
        let filtered = [...userList];
        
        if (currentFilters.rol !== 'todos') {
            filtered = filtered.filter(u => u.rol === currentFilters.rol);
        }
        
        if (currentFilters.estado !== 'todos') {
            const isActive = currentFilters.estado === 'activo';
            filtered = filtered.filter(u => u.activo === isActive);
        }
        
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            filtered = filtered.filter(u => 
                u.nombre.toLowerCase().includes(searchLower) ||
                u.email.toLowerCase().includes(searchLower)
            );
        }
        
        setFilteredUsers(filtered);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        applyFilters(users, newFilters);
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/${userId}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ activo: !currentStatus })
            });
            const data = await response.json();
            if (data.success) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const resetPassword = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                alert(`Nueva contraseña: ${data.tempPassword}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const createUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    password: formData.password || `${formData.nombre.split(' ')[0]}123*`
                })
            });
            const data = await response.json();
            if (data.success) {
                setShowCreateModal(false);
                fetchUsers();
                setFormData({
                    nombre: '',
                    email: '',
                    rol: 'acudiente',
                    password: '',
                    estudiantesAsociados: [],
                    cursosAsignados: []
                });
                alert('Usuario creado exitosamente');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getAsignacionText = (user) => {
        if (user.rol === 'docente') {
            return user.cursosAsignados?.join(', ') || 'Sin asignar';
        }
        if (user.rol === 'acudiente') {
            const estudianteNombres = user.estudiantesAsociados
                ?.map(id => {
                    const est = students.find(s => s._id === id);
                    return est?.apellido || 'Desconocido';
                })
                .join(', ') || 'Sin estudiantes';
            return estudianteNombres;
        }
        return '-';
    };

    return (
        <div style={styles.container}>
            {/* Header con logos */}
            <div style={styles.header}>
                <div style={styles.logoContainer}>
                    <img 
                        src="/images/logo-orizon.png" 
                        alt="Orizon Cottage" 
                        style={styles.logo}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
                <div style={styles.titleContainer}>
                    <h1 style={styles.mainTitle}>Orizon Cottage</h1>
                    <p style={styles.subTitle}>Gestión de Convivencia</p>
                </div>
                <div style={styles.schoolLogoContainer}>
                    <img 
                        src="/images/logo-cabana.png" 
                        alt="I.E. La Cabaña" 
                        style={styles.schoolLogo}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            </div>

            {/* Panel principal */}
            <div style={styles.dashboard}>
                <div style={styles.sidebar}>
                    <h3 style={styles.sidebarTitle}>Panel Principal</h3>
                    <ul style={styles.menuList}>
                        <li style={styles.menuItem}>📊 Seguimiento General</li>
                        <li style={styles.menuItem}>📈 Reportes</li>
                        <li style={styles.menuItemActive}>👥 Gestión de Usuarios</li>
                        <li style={styles.menuItem}>💬 Mensajería</li>
                    </ul>
                </div>

                <div style={styles.content}>
                    <div style={styles.contentHeader}>
                        <h2 style={styles.contentTitle}>Gestión de Usuarios</h2>
                        <p style={styles.contentSubtitle}>Administre usuarios y roles del sistema</p>
                    </div>

                    {/* Filtros */}
                    <div style={styles.filtersContainer}>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Rol</label>
                            <select 
                                style={styles.filterSelect}
                                value={filters.rol}
                                onChange={(e) => handleFilterChange('rol', e.target.value)}
                            >
                                <option value="todos">Todos los roles</option>
                                <option value="admin">Administrador</option>
                                <option value="directivo">Directivo</option>
                                <option value="docente">Docente</option>
                                <option value="acudiente">Acudiente</option>
                            </select>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Estado</label>
                            <select 
                                style={styles.filterSelect}
                                value={filters.estado}
                                onChange={(e) => handleFilterChange('estado', e.target.value)}
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
                                style={styles.filterInput}
                                placeholder="Buscar por nombre..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>

                        <button 
                            style={styles.createButton}
                            onClick={() => setShowCreateModal(true)}
                        >
                            + Nuevo Usuario
                        </button>
                    </div>

                    {/* Tabla de usuarios */}
                    <div style={styles.tableContainer}>
                        {loading ? (
                            <p>Cargando...</p>
                        ) : (
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeader}>
                                        <th style={styles.tableHeaderCell}>Nombre</th>
                                        <th style={styles.tableHeaderCell}>Rol</th>
                                        <th style={styles.tableHeaderCell}>Asignación</th>
                                        <th style={styles.tableHeaderCell}>Estado</th>
                                        <th style={styles.tableHeaderCell}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, index) => (
                                        <tr key={user._id} style={styles.tableRow}>
                                            <td style={styles.tableCell}>
                                                <div>
                                                    <strong>{user.nombre}</strong>
                                                    <br />
                                                    <small style={styles.emailText}>{user.email}</small>
                                                </div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <span style={{
                                                    ...styles.roleBadge,
                                                    backgroundColor: user.rol === 'admin' ? '#e74c3c' :
                                                                    user.rol === 'directivo' ? '#f39c12' :
                                                                    user.rol === 'docente' ? '#3498db' : '#27ae60',
                                                    color: 'white'
                                                }}>
                                                    {user.rol}
                                                </span>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <small>{getAsignacionText(user)}</small>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <span className={`status-badge ${user.activo ? 'status-active' : 'status-inactive'}`}>
                                                    {user.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <button 
                                                    style={styles.actionButton}
                                                    onClick={() => setSelectedUser(user)}
                                                >
                                                    👁️
                                                </button>
                                                <button 
                                                    style={styles.actionButton}
                                                    onClick={() => toggleUserStatus(user._id, user.activo)}
                                                >
                                                    {user.activo ? '🔒' : '🔓'}
                                                </button>
                                                <button 
                                                    style={styles.actionButton}
                                                    onClick={() => resetPassword(user._id)}
                                                >
                                                    🔑
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para crear usuario */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={styles.modalTitle}>Crear Nuevo Usuario</h3>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Nombre</label>
                            <input
                                type="text"
                                style={styles.formInput}
                                value={formData.nombre}
                                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Email</label>
                            <input
                                type="email"
                                style={styles.formInput}
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Rol</label>
                            <select
                                style={styles.formSelect}
                                value={formData.rol}
                                onChange={(e) => setFormData({...formData, rol: e.target.value})}
                            >
                                <option value="acudiente">Acudiente</option>
                                <option value="docente">Docente</option>
                                <option value="directivo">Directivo</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Contraseña (opcional)</label>
                            <input
                                type="password"
                                style={styles.formInput}
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="Dejar vacío para generar automática"
                            />
                        </div>

                        <div style={styles.modalButtons}>
                            <button 
                                style={styles.modalCancelButton}
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancelar
                            </button>
                            <button 
                                style={styles.modalCreateButton}
                                onClick={createUser}
                            >
                                Crear Usuario
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
    },
    header: {
        backgroundColor: 'white',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    logoContainer: {
        width: '120px'
    },
    logo: {
        maxWidth: '120px',
        maxHeight: '60px'
    },
    titleContainer: {
        textAlign: 'center'
    },
    mainTitle: {
        margin: 0,
        color: '#27ae60',
        fontSize: '24px',
        fontWeight: 'bold'
    },
    subTitle: {
        margin: '5px 0 0 0',
        color: '#7f8c8d',
        fontSize: '14px'
    },
    schoolLogoContainer: {
        width: '80px',
        textAlign: 'right'
    },
    schoolLogo: {
        maxWidth: '80px',
        maxHeight: '60px'
    },
    dashboard: {
        display: 'flex',
        padding: '20px',
        gap: '20px'
    },
    sidebar: {
        width: '250px',
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        height: 'fit-content'
    },
    sidebarTitle: {
        margin: '0 0 20px 0',
        color: '#2c3e50',
        fontSize: '18px',
        borderBottom: '2px solid #27ae60',
        paddingBottom: '10px'
    },
    menuList: {
        listStyle: 'none',
        padding: 0,
        margin: 0
    },
    menuItem: {
        padding: '12px 15px',
        margin: '5px 0',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '#7f8c8d',
        transition: 'all 0.3s',
        ':hover': {
            backgroundColor: '#f0f0f0'
        }
    },
    menuItemActive: {
        padding: '12px 15px',
        margin: '5px 0',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: '#27ae60',
        color: 'white'
    },
    content: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '25px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    contentHeader: {
        marginBottom: '25px'
    },
    contentTitle: {
        margin: 0,
        color: '#2c3e50',
        fontSize: '22px'
    },
    contentSubtitle: {
        margin: '5px 0 0 0',
        color: '#7f8c8d',
        fontSize: '14px'
    },
    filtersContainer: {
        display: 'flex',
        gap: '15px',
        marginBottom: '25px',
        alignItems: 'flex-end'
    },
    filterGroup: {
        flex: 1
    },
    filterLabel: {
        display: 'block',
        marginBottom: '5px',
        color: '#34495e',
        fontWeight: 'bold',
        fontSize: '13px'
    },
    filterSelect: {
        width: '100%',
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    filterInput: {
        width: '100%',
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px'
    },
    createButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
    },
    tableContainer: {
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    tableHeader: {
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #27ae60'
    },
    tableHeaderCell: {
        padding: '15px',
        textAlign: 'left',
        fontWeight: 'bold',
        color: '#2c3e50',
        fontSize: '14px'
    },
    tableRow: {
        borderBottom: '1px solid #ecf0f1',
        transition: 'background-color 0.3s'
    },
    tableCell: {
        padding: '15px',
        fontSize: '14px'
    },
    emailText: {
        color: '#7f8c8d',
        fontSize: '12px'
    },
    roleBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-block'
    },
    actionButton: {
        margin: '0 5px',
        padding: '5px 8px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'transform 0.2s',
        ':hover': {
            transform: 'scale(1.1)'
        }
    },
    modalTitle: {
        margin: '0 0 20px 0',
        color: '#2c3e50'
    },
    formGroup: {
        marginBottom: '15px'
    },
    formLabel: {
        display: 'block',
        marginBottom: '5px',
        color: '#34495e',
        fontWeight: 'bold',
        fontSize: '13px'
    },
    formInput: {
        width: '100%',
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    formSelect: {
        width: '100%',
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    modalButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '20px'
    },
    modalCancelButton: {
        padding: '10px 20px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    modalCreateButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    }
};

export default UserManagement;
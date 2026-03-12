// Frontend/src/Pages/UserManagement.jsx
import { useState, useEffect } from 'react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [filteredData, setFilteredData] = useState({
        users: [],
        teachers: [],
        students: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [filters, setFilters] = useState({
        rol: 'todos',
        estado: 'todos',
        search: '',
        grado: 'todos',
        codigo: '',
        asignatura: 'todos'
    });

    // Estadísticas
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTeachers: 0,
        totalStudents: 0,
        activos: 0,
        inactivos: 0,
        docentes: 0,
        acudientes: 0,
        directivos: 0,
        admins: 0,
        preescolar: 0,
        primaria: 0,
        secundaria: 0
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        applyFilters();
        calculateStats();
    }, [users, teachers, students, filters, activeTab]);

    const fetchAllData = async () => {
        setLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('token');
            
            // 1. Obtener usuarios (acudientes, directivos, admins)
            const usersResponse = await fetch('http://localhost:5000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!usersResponse.ok) {
                throw new Error(`Error HTTP usuarios: ${usersResponse.status}`);
            }

            const usersData = await usersResponse.json();
            
            if (usersData.success) {
                setUsers(usersData.users || []);
            }

            // 2. Obtener docentes desde teachers
            const teachersResponse = await fetch('http://localhost:5000/api/teachers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!teachersResponse.ok) {
                throw new Error(`Error HTTP docentes: ${teachersResponse.status}`);
            }

            const teachersData = await teachersResponse.json();
            console.log('👨‍🏫 Docentes recibidos:', teachersData);
            
            if (teachersData.success) {
                setTeachers(teachersData.data || []);
            }

            // 3. Obtener estudiantes
            const studentsResponse = await fetch('http://localhost:5000/api/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!studentsResponse.ok) {
                throw new Error(`Error HTTP estudiantes: ${studentsResponse.status}`);
            }

            const studentsData = await studentsResponse.json();
            
            if (studentsData.success) {
                setStudents(studentsData.data || []);
            }

        } catch (error) {
            console.error('❌ Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        setStats({
            totalUsers: users.length,
            totalTeachers: teachers.length,
            totalStudents: students.length,
            activos: users.filter(u => u.activo).length + teachers.length,
            inactivos: users.filter(u => !u.activo).length,
            docentes: teachers.length,
            acudientes: users.filter(u => u.rol === 'acudiente').length,
            directivos: users.filter(u => u.rol === 'directivo').length,
            admins: users.filter(u => u.rol === 'admin').length,
            preescolar: students.filter(s => s.grado === 'preescolar').length,
            primaria: students.filter(s => s.grado === 'primaria').length,
            secundaria: students.filter(s => s.grado === 'secundaria').length
        });
    };

    const applyFilters = () => {
        // Filtrar usuarios (acudientes, directivos, admins)
        let filteredUsers = [...users];
        
        if (filters.rol !== 'todos' && filters.rol !== 'docente') {
            filteredUsers = filteredUsers.filter(u => u.rol === filters.rol);
        }
        
        if (filters.estado !== 'todos') {
            const isActive = filters.estado === 'activo';
            filteredUsers = filteredUsers.filter(u => u.activo === isActive);
        }
        
        if (filters.search.trim() !== '') {
            const term = filters.search.toLowerCase();
            filteredUsers = filteredUsers.filter(u => 
                u.nombre?.toLowerCase().includes(term) ||
                u.numeroIdentificacion?.includes(term) ||
                u.email?.toLowerCase().includes(term)
            );
        }

        // Filtrar docentes
        let filteredTeachers = [...teachers];
        
        if (filters.codigo && filters.codigo.trim() !== '') {
            const term = filters.codigo.toLowerCase();
            filteredTeachers = filteredTeachers.filter(t => 
                t.id_docente?.toString().toLowerCase().includes(term) ||
                t.no?.toString().toLowerCase().includes(term)
            );
        }

        // Filtro por asignatura
        if (filters.asignatura && filters.asignatura !== 'todos') {
            filteredTeachers = filteredTeachers.filter(t => 
                t.asignatura?.toLowerCase() === filters.asignatura.toLowerCase()
            );
        }       

        // Filtro por búsqueda general
        if (filters.search.trim() !== '') {
            const term = filters.search.toLowerCase();
            filteredTeachers = filteredTeachers.filter(t => 
                t.docente?.toLowerCase().includes(term) ||
                t.id_docente?.toString().includes(term) ||
                t.no?.toString().includes(term) ||
                t.asignatura?.toLowerCase().includes(term) ||
                t.grados?.toLowerCase().includes(term)
            );
        }
        
        // Filtrar estudiantes
        let filteredStudents = [...students];
        
        if (activeTab === 'students') {
            if (filters.grado !== 'todos') {
                filteredStudents = filteredStudents.filter(s => s.grado === filters.grado);
            }
            
            if (filters.search.trim() !== '') {
                const term = filters.search.toLowerCase();
                filteredStudents = filteredStudents.filter(s => 
                    s.apellido1?.toLowerCase().includes(term) ||
                    s.apellido?.toLowerCase().includes(term) ||
                    s.id_estudiante?.includes(term) ||
                    s.nombre_acudiente?.toLowerCase().includes(term)
                );
            }
        }
        
        setFilteredData({
            users: filteredUsers,
            teachers: filteredTeachers,
            students: filteredStudents
        });
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const grados = ['todos', ...new Set(students.map(s => s.grado).filter(Boolean))];
    const asignaturas = ['todos', ...new Set(teachers.map(t => t.asignatura).filter(Boolean))];

    if (loading) {
        return (
            <div style={styles.container}>
                <h2 style={styles.title}>Gestión de Usuarios</h2>
                <p>Cargando datos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <h2 style={styles.title}>Gestión de Usuarios</h2>
                <div style={styles.error}>
                    <p>Error: {error}</p>
                    <button onClick={fetchAllData} style={styles.retryButton}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Gestión de Usuarios</h2>
                <p style={styles.subtitle}>Administre usuarios, roles y estudiantes del sistema</p>
            </div>

            {/* Tarjetas de estadísticas */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard} onClick={() => setActiveTab('users')}>
                    <span style={styles.statValue}>{stats.totalUsers}</span>
                    <span style={styles.statLabel}>Usuarios</span>
                </div>
                <div style={styles.statCard} onClick={() => setActiveTab('teachers')}>
                    <span style={styles.statValue}>{stats.totalTeachers}</span>
                    <span style={styles.statLabel}>Docentes</span>
                </div>
                <div style={styles.statCard} onClick={() => setActiveTab('students')}>
                    <span style={styles.statValue}>{stats.totalStudents}</span>
                    <span style={styles.statLabel}>Estudiantes</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#27ae60'}}>
                    <span style={styles.statValue}>{stats.activos}</span>
                    <span style={styles.statLabel}>Activos</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#3498db'}}>
                    <span style={styles.statValue}>{stats.docentes}</span>
                    <span style={styles.statLabel}>Docentes</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#f39c12'}}>
                    <span style={styles.statValue}>{stats.acudientes}</span>
                    <span style={styles.statLabel}>Acudientes</span>
                </div>
            </div>

            {/* Tabs de navegación */}
            <div style={styles.tabsContainer}>
                <button 
                    style={{...styles.tab, ...(activeTab === 'users' && styles.activeTab)}}
                    onClick={() => setActiveTab('users')}
                >
                    👥 Usuarios ({filteredData.users.length})
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'teachers' && styles.activeTab)}}
                    onClick={() => setActiveTab('teachers')}
                >
                    👨‍🏫 Docentes ({filteredData.teachers.length})
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'students' && styles.activeTab)}}
                    onClick={() => setActiveTab('students')}
                >
                    🧑‍🎓 Estudiantes ({filteredData.students.length})
                </button>
            </div>

            {/* Filtros */}
            <div style={styles.filtersContainer}>
                {activeTab === 'users' && (
                    <>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Rol</label>
                            <select 
                                value={filters.rol}
                                onChange={(e) => handleFilterChange('rol', e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="todos">Todos los roles</option>
                                <option value="acudiente">Acudientes</option>
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
                    </>
                )}

                {activeTab === 'teachers' && (
                    <>
                         <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Código</label>
                            <input
                                type="text"
                                value={filters.codigo || ''}
                                onChange={(e) => handleFilterChange('codigo', e.target.value)}
                                placeholder="Filtrar por código..."
                                style={styles.filterInput}
                            />
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Asignatura</label>
                            <select 
                                value={filters.asignatura}
                                onChange={(e) => handleFilterChange('asignatura', e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="todos">Todas las asignaturas</option>
                                {asignaturas.filter(a => a !== 'todos').map(asig => (
                                    <option key={asig} value={asig}>{asig}</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Buscar</label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Buscar por nombre, código o asignatura..."
                                style={styles.filterInput}
                            />
                        </div>
                    </>
                )}

                {activeTab === 'students' && (
                    <>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Grado</label>
                            <select 
                                value={filters.grado}
                                onChange={(e) => handleFilterChange('grado', e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="todos">Todos los grados</option>
                                {grados.filter(g => g !== 'todos').map(grado => (
                                    <option key={grado} value={grado}>
                                        {grado}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Buscar</label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Buscar por nombre, ID o acudiente..."
                                style={styles.filterInput}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Tablas según pestaña activa */}
            <div style={styles.tableContainer}>
                {activeTab === 'users' && (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Nombre</th>
                                <th style={styles.th}>Identificación</th>
                                <th style={styles.th}>Rol</th>
                                <th style={styles.th}>Estado</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.users.length > 0 ? (
                                filteredData.users.map((user) => (
                                    <tr key={user._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <strong>{user.nombre}</strong>
                                            <br />
                                            <small style={styles.emailText}>{user.email || ''}</small>
                                        </td>
                                        <td style={styles.td}>{user.numeroIdentificacion}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.roleBadge,
                                                backgroundColor: user.rol === 'admin' ? '#e74c3c' :
                                                                user.rol === 'directivo' ? '#f39c12' : '#27ae60'
                                            }}>
                                                {user.rol}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: user.activo ? '#27ae60' : '#e74c3c',
                                                color: 'white'
                                            }}>
                                                {user.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button style={styles.actionButton}>🔒</button>
                                            <button style={styles.actionButton}>🔑</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={styles.emptyMessage}>
                                        No hay usuarios para mostrar
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {activeTab === 'teachers' && (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Código</th>
                                <th style={styles.th}>Docente</th>
                                <th style={styles.th}>Asignatura</th>
                                <th style={styles.th}>Grados</th>
                                <th style={styles.th}>Grupo</th>
                                <th style={styles.th}>Horas</th>
                            </tr>
                        </thead>
                        <tbody>
                           {filteredData.teachers.length > 0 ? (
                                filteredData.teachers.map((teacher) => (
                                    <tr key={teacher._id || teacher.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <strong>{teacher.id_docente || teacher.no || 'N/A'}</strong>
                                        </td>
                                            <td style={styles.td}>
                                            <strong>{teacher.docente}</strong>
                                        </td>
                                        <td style={styles.td}>{teacher.asignatura}</td>
                                        <td style={styles.td}>{teacher.grados}</td>
                                        <td style={styles.td}>{teacher.direccion_grupo}</td>
                                        <td style={styles.td}>{teacher.horas_totales || teacher.horas_semanales}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={styles.emptyMessage}>
                                        No hay docentes para mostrar
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {activeTab === 'students' && (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>ID Estudiante</th>
                                <th style={styles.th}>Nombre Completo</th>
                                <th style={styles.th}>Grado</th>
                                <th style={styles.th}>Acudiente</th>
                                <th style={styles.th}>Teléfono</th>
                                <th style={styles.th}>Vereda</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.students.length > 0 ? (
                                filteredData.students.map((student) => (
                                    <tr key={student._id} style={styles.tr}>
                                        <td style={styles.td}>{student.id_estudiante}</td>
                                        <td style={styles.td}>
                                            <strong>{student.apellido1 || student.apellido || 'N/A'}</strong>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.gradeBadge,
                                                backgroundColor: student.grado === 'preescolar' ? '#27ae60' :
                                                               student.grado === 'primaria' ? '#2980b9' : 
                                                               student.grado === 'secundaria' ? '#8e44ad' : '#95a5a6'
                                            }}>
                                                {student.grado || 'N/A'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{student.nombre_acudiente || '-'}</td>
                                        <td style={styles.td}>{student.telefono || '-'}</td>
                                        <td style={styles.td}>{student.vereda || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={styles.emptyMessage}>
                                        No hay estudiantes para mostrar
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
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
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s'
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
    tabsContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #ecf0f1',
        paddingBottom: '10px'
    },
    tab: {
        padding: '10px 20px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#7f8c8d',
        borderRadius: '5px 5px 0 0'
    },
    activeTab: {
        color: '#27ae60',
        borderBottom: '2px solid #27ae60',
        fontWeight: 'bold'
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
    emailText: {
        color: '#7f8c8d',
        fontSize: '12px'
    },
    roleBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-block'
    },
    gradeBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-block'
    },
    statusBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-block'
    },
    actionButton: {
        margin: '0 5px',
        padding: '5px 10px',
        border: 'none',
        borderRadius: '3px',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '16px'
    },
    emptyMessage: {
        textAlign: 'center',
        padding: '40px',
        color: '#95a5a6'
    }
};

export default UserManagement;
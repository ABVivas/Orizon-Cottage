// Frontend/src/Pages/AdminUserManagement.jsx
import { useState, useEffect } from 'react';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [filteredData, setFilteredData] = useState({ users: [], teachers: [], students: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('students');
    const [filters, setFilters] = useState({ 
        rol: 'todos', 
        estado: 'todos', 
        search: '', 
        grado: 'todos',
        codigo: '',
        asignatura: 'todos'
    });
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    
    // Estados para modales
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'student', 'teacher', 'user'
    const [selectedItem, setSelectedItem] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    
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

    const formatGrado = (grado) => {
        if (!grado) return '';
        if (grado.includes('°')) return grado;
        const gradoMap = { 
            'preescolar': '0°', 'primero': '1°', 'segundo': '2°', 'tercero': '3°', 
            'cuarto': '4°', 'quinto': '5°', 'sexto': '6°', 'septimo': '7°', 
            'octavo': '8°', 'noveno': '9°', 'decimo': '10°', 'once': '11°' 
        };
        return gradoMap[grado.toLowerCase()] || grado;
    };

    const getUniqueTeachers = (teachersList) => {
        const uniqueMap = new Map();
        teachersList.forEach(teacher => {
            if (!uniqueMap.has(teacher.docente)) {
                uniqueMap.set(teacher.docente, teacher);
            }
        });
        return Array.from(uniqueMap.values());
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        applyFilters();
        calculateStats();
        setCurrentPage(1);
    }, [users, teachers, students, filters, activeTab]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            const usersRes = await fetch('http://localhost:5000/api/users', { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            const usersData = await usersRes.json();
            if (usersData.success) {
                setUsers(usersData.users || []);
            }
            
            const teachersRes = await fetch('http://localhost:5000/api/teachers', { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            const teachersData = await teachersRes.json();
            if (teachersData.success) {
                setTeachers(getUniqueTeachers(teachersData.data || []));
            }
            
            const studentsRes = await fetch('http://localhost:5000/api/students', { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            const studentsData = await studentsRes.json();
            if (studentsData.success) {
                setStudents(studentsData.data || []);
            }
            
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const usuariosAcceso = users.filter(u => u.rol === 'admin' || u.rol === 'directivo' || u.rol === 'docente' || u.rol === 'acudiente');
        const docentesUnicos = teachers.length;
        const totalEstudiantes = students.length;
        const activos = users.filter(u => u.activo === true).length;
        const acudientesUnicos = users.filter(u => u.rol === 'acudiente').length;
        const admins = users.filter(u => u.rol === 'admin').length;
        const directivos = users.filter(u => u.rol === 'directivo').length;
        const docentesUsers = users.filter(u => u.rol === 'docente').length;
        
        const preescolar = students.filter(s => s.grado_especifico === '0°').length;
        const primaria = students.filter(s => ['1°', '2°', '3°', '4°', '5°'].includes(s.grado_especifico)).length;
        const secundaria = students.filter(s => ['6°', '7°', '8°', '9°', '10°', '11°'].includes(s.grado_especifico)).length;
        
        setStats({
            totalUsers: usuariosAcceso.length,
            totalTeachers: docentesUnicos,
            totalStudents: totalEstudiantes,
            activos: activos,
            inactivos: users.filter(u => u.activo === false).length,
            docentes: docentesUsers,
            acudientes: acudientesUnicos,
            directivos: directivos,
            admins: admins,
            preescolar: preescolar,
            primaria: primaria,
            secundaria: secundaria
        });
    };

    const applyFilters = () => {
        let filteredUsers = [...users];
        if (filters.rol !== 'todos') {
            filteredUsers = filteredUsers.filter(u => u.rol === filters.rol);
        }
        if (filters.estado !== 'todos') {
            filteredUsers = filteredUsers.filter(u => u.activo === (filters.estado === 'activo'));
        }
        if (filters.search) {
            filteredUsers = filteredUsers.filter(u => 
                u.nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
                u.numeroIdentificacion?.includes(filters.search)
            );
        }
        
        let filteredTeachers = [...teachers];
        if (filters.codigo) {
            filteredTeachers = filteredTeachers.filter(t => 
                t.id_docente?.toString().includes(filters.codigo)
            );
        }
        if (filters.asignatura !== 'todos') {
            filteredTeachers = filteredTeachers.filter(t => 
                t.asignatura === filters.asignatura
            );
        }
        if (filters.search) {
            filteredTeachers = filteredTeachers.filter(t => 
                t.docente?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }
        
        let filteredStudents = [...students];
        if (activeTab === 'students') {
            if (filters.grado !== 'todos') {
                filteredStudents = filteredStudents.filter(s => 
                    s.grado_especifico === formatGrado(filters.grado)
                );
            }
            if (filters.search) {
                filteredStudents = filteredStudents.filter(s => 
                    s.apellido1?.toLowerCase().includes(filters.search.toLowerCase()) ||
                    s.id_estudiante?.includes(filters.search) ||
                    s.nombre_acudiente?.toLowerCase().includes(filters.search.toLowerCase())
                );
            }
        }
        
        setFilteredData({ users: filteredUsers, teachers: filteredTeachers, students: filteredStudents });
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    const getPaginatedData = (data) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };
    
    const totalPages = (data) => Math.ceil(data.length / itemsPerPage);
    
    // ========== FUNCIONES DE EDICIÓN ==========
    
    const openEditStudent = (student) => {
        setModalType('student');
        setSelectedItem(student);
        setEditForm({
            id_estudiante: student.id_estudiante || '',
            apellido1: student.apellido1 || student.apellido || '',
            grado_especifico: student.grado_especifico || student.grado || '0°',
            nombre_acudiente: student.nombre_acudiente || '',
            cedula_padre: student.cedula_padre || '',
            telefono: student.telefono || '',
            vereda: student.vereda || '',
            parentesco: student.parentesco || 'PADRE',
            activo: student.activo !== undefined ? student.activo : true
        });
        setShowModal(true);
    };
    
    const openEditTeacher = (teacher) => {
        setModalType('teacher');
        setSelectedItem(teacher);
        // Buscar el usuario docente correspondiente
        const teacherUser = users.find(u => u.nombre === teacher.docente && u.rol === 'docente');
        setEditForm({
            nombre: teacher.docente || '',
            numeroIdentificacion: teacherUser?.numeroIdentificacion || teacher.id_docente || '',
            cursosAsignados: teacherUser?.cursosAsignados?.join(', ') || teacher.grados || '',
            activo: teacherUser?.activo !== undefined ? teacherUser.activo : true
        });
        setShowModal(true);
    };
    
    const openEditUser = (user) => {
        setModalType('user');
        setSelectedItem(user);
        setEditForm({
            nombre: user.nombre || '',
            numeroIdentificacion: user.numeroIdentificacion || '',
            email: user.email || '',
            telefono: user.telefono || '',
            rol: user.rol || '',
            activo: user.activo !== undefined ? user.activo : true
        });
        setShowModal(true);
    };
    
    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            
            if (modalType === 'student') {
                // Actualizar estudiante
                console.log('📝 Actualizando estudiante ID:', selectedItem._id);
                console.log('📝 Datos a enviar:', editForm);
                
                const response = await fetch(`http://localhost:5000/api/students/${selectedItem._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(editForm)
                });
                
                console.log('📡 Respuesta status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                const data = await response.json();
                console.log('📡 Respuesta data:', data);
                
                if (data.success) {
                    alert('✅ Estudiante actualizado correctamente');
                    await fetchAllData();
                    setShowModal(false);
                } else {
                    alert('❌ Error: ' + (data.message || 'No se pudo actualizar'));
                }
            } 
            else if (modalType === 'teacher') {
                // Buscar el usuario docente
                const teacherUser = users.find(u => u.nombre === selectedItem.docente && u.rol === 'docente');
                if (teacherUser) {
                    console.log('📝 Actualizando docente ID:', teacherUser._id);
                    
                    const response = await fetch(`http://localhost:5000/api/users/${teacherUser._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            nombre: editForm.nombre,
                            numeroIdentificacion: editForm.numeroIdentificacion,
                            cursosAsignados: editForm.cursosAsignados ? editForm.cursosAsignados.split(',').map(c => c.trim()) : [],
                            activo: editForm.activo
                        })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                        alert('✅ Docente actualizado correctamente');
                        await fetchAllData();
                        setShowModal(false);
                    } else {
                        alert('❌ Error: ' + (data.message || 'No se pudo actualizar'));
                    }
                } else {
                    alert('❌ No se encontró el usuario docente correspondiente');
                }
            } 
            else if (modalType === 'user') {
                // Actualizar usuario (acudiente, directivo, admin)
                console.log('📝 Actualizando usuario ID:', selectedItem._id);
                
                const response = await fetch(`http://localhost:5000/api/users/${selectedItem._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nombre: editForm.nombre,
                        email: editForm.email,
                        telefono: editForm.telefono,
                        activo: editForm.activo
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    alert('✅ Usuario actualizado correctamente');
                    await fetchAllData();
                    setShowModal(false);
                } else {
                    alert('❌ Error: ' + (data.message || 'No se pudo actualizar'));
                }
            }
            
        } catch (error) {
            console.error('Error detallado:', error);
            alert('❌ Error de conexión: ' + error.message);
        } finally {
            setSaving(false);
        }
    };
    
    const toggleUserStatus = async (userId, currentStatus) => {
        if (!confirm(`¿${currentStatus ? 'Desactivar' : 'Activar'} este usuario?`)) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/${userId}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ activo: !currentStatus })
            });
            const data = await response.json();
            if (data.success) {
                alert(`✅ Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`);
                fetchAllData();
            } else {
                alert('❌ Error al cambiar estado');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión');
        }
    };
    
    const resetUserPassword = async (userId, userName) => {
        if (!confirm(`¿Resetear contraseña para ${userName}? Se generará una nueva contraseña temporal.`)) return;
        
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
                alert(`✅ Nueva contraseña temporal: ${data.tempPassword}\n\nEl usuario deberá cambiarla al iniciar sesión.`);
            } else {
                alert('❌ Error al resetear contraseña');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión');
        }
    };
    
    const gradosNumericos = ['todos', '0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
    const asignaturas = ['todos', ...new Set(teachers.map(t => t.asignatura).filter(Boolean))];
    
    const parentescoOptions = ['PADRE', 'MADRE', 'ABUELO', 'TIO', 'OTRO'];

    if (loading) {
        return <div style={styles.container}><h2 style={styles.title}>Gestión de Usuarios</h2><p>Cargando datos...</p></div>;
    }

    if (error) {
        return (
            <div style={styles.container}>
                <h2 style={styles.title}>Gestión de Usuarios</h2>
                <div style={styles.error}>
                    <p>{error}</p>
                    <button onClick={fetchAllData} style={styles.retryButton}>Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Gestión de Usuarios</h2>
                <p style={styles.subtitle}>Administre usuarios, docentes y estudiantes del sistema</p>
            </div>
            
            {/* Stats Grid */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard} onClick={() => setActiveTab('users')}>
                    <span style={styles.statValue}>{stats.totalUsers}</span>
                    <span style={styles.statLabel}>Total Usuarios</span>
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
                    <span style={styles.statLabel}>Personas Activas</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#f39c12'}}>
                    <span style={styles.statValue}>{stats.acudientes}</span>
                    <span style={styles.statLabel}>Acudientes</span>
                </div>
            </div>
            
            {/* Tabs */}
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
            
            {/* Filters */}
            <div style={styles.filtersContainer}>
                {activeTab === 'users' && (
                    <>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Rol</label>
                            <select value={filters.rol} onChange={(e) => handleFilterChange('rol', e.target.value)} style={styles.filterSelect}>
                                <option value="todos">Todos</option>
                                <option value="admin">Administradores</option>
                                <option value="directivo">Directivos</option>
                                <option value="docente">Docentes</option>
                                <option value="acudiente">Acudientes</option>
                            </select>
                        </div>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Estado</label>
                            <select value={filters.estado} onChange={(e) => handleFilterChange('estado', e.target.value)} style={styles.filterSelect}>
                                <option value="todos">Todos</option>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Buscar</label>
                            <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Buscar por nombre o ID..." style={styles.filterInput} />
                        </div>
                    </>
                )}
                
                {activeTab === 'teachers' && (
                    <>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Código</label>
                            <input type="text" value={filters.codigo} onChange={(e) => handleFilterChange('codigo', e.target.value)} placeholder="Filtrar por código..." style={styles.filterInput} />
                        </div>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Asignatura</label>
                            <select value={filters.asignatura} onChange={(e) => handleFilterChange('asignatura', e.target.value)} style={styles.filterSelect}>
                                <option value="todos">Todas</option>
                                {asignaturas.filter(a => a !== 'todos').map(asig => (
                                    <option key={asig} value={asig}>{asig}</option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Buscar</label>
                            <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Buscar por nombre..." style={styles.filterInput} />
                        </div>
                    </>
                )}
                
                {activeTab === 'students' && (
                    <>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Grado</label>
                            <select value={filters.grado} onChange={(e) => handleFilterChange('grado', e.target.value)} style={styles.filterSelect}>
                                {gradosNumericos.map(g => (
                                    <option key={g} value={g}>{g === 'todos' ? 'Todos los grados' : g}</option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Buscar</label>
                            <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Buscar por nombre, ID o acudiente..." style={styles.filterInput} />
                        </div>
                    </>
                )}
            </div>
            
            {/* Tables */}
            <div style={styles.tableContainer}>
                {activeTab === 'users' && (
                    <>
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
                                {getPaginatedData(filteredData.users).map(u => (
                                    <tr key={u._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <strong>{u.nombre}</strong>
                                            <br /><small style={styles.emailText}>{u.email || ''}</small>
                                        </td>
                                        <td style={styles.td}>{u.numeroIdentificacion}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.roleBadge,
                                                backgroundColor: u.rol === 'admin' ? '#e74c3c' : u.rol === 'directivo' ? '#f39c12' : u.rol === 'docente' ? '#27ae60' : '#3498db'
                                            }}>
                                                {u.rol === 'admin' ? 'Admin' : u.rol === 'directivo' ? 'Directivo' : u.rol === 'docente' ? 'Docente' : 'Acudiente'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{...styles.statusBadge, backgroundColor: u.activo ? '#27ae60' : '#e74c3c'}}>
                                                {u.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button style={styles.actionButton} onClick={() => openEditUser(u)} title="Editar">✏️</button>
                                            <button style={styles.actionButton} onClick={() => toggleUserStatus(u._id, u.activo)} title={u.activo ? 'Desactivar' : 'Activar'}>
                                                {u.activo ? '🔒' : '🔓'}
                                            </button>
                                            <button style={styles.actionButton} onClick={() => resetUserPassword(u._id, u.nombre)} title="Resetear contraseña">🔑</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredData.users.length > itemsPerPage && (
                            <div style={styles.pagination}>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} style={styles.pageButton}>◀ Anterior</button>
                                <span style={styles.pageInfo}>Página {currentPage} de {totalPages(filteredData.users)}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages(filteredData.users), p+1))} disabled={currentPage === totalPages(filteredData.users)} style={styles.pageButton}>Siguiente ▶</button>
                            </div>
                        )}
                    </>
                )}
                
                {activeTab === 'teachers' && (
                    <>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>Código</th>
                                    <th style={styles.th}>Docente</th>
                                    <th style={styles.th}>Asignatura</th>
                                    <th style={styles.th}>Grados</th>
                                    <th style={styles.th}>Acciones</th>
                                 </tr>
                            </thead>
                            <tbody>
                                {getPaginatedData(filteredData.teachers).map(t => {
                                    const teacherUser = users.find(u => u.nombre === t.docente && u.rol === 'docente');
                                    return (
                                        <tr key={t._id} style={styles.tr}>
                                            <td style={styles.td}><strong>{t.id_docente || t.no || 'N/A'}</strong></td>
                                            <td style={styles.td}><strong>{t.docente}</strong></td>
                                            <td style={styles.td}>{t.asignatura}</td>
                                            <td style={styles.td}>{t.grados}</td>
                                            <td style={styles.td}>
                                                <button style={styles.actionButton} onClick={() => openEditTeacher(t)} title="Editar">✏️</button>
                                                {teacherUser && (
                                                    <>
                                                        <button style={styles.actionButton} onClick={() => toggleUserStatus(teacherUser._id, teacherUser.activo)} title={teacherUser.activo ? 'Desactivar' : 'Activar'}>
                                                            {teacherUser.activo ? '🔒' : '🔓'}
                                                        </button>
                                                        <button style={styles.actionButton} onClick={() => resetUserPassword(teacherUser._id, t.docente)} title="Resetear contraseña">🔑</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredData.teachers.length > itemsPerPage && (
                            <div style={styles.pagination}>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} style={styles.pageButton}>◀ Anterior</button>
                                <span style={styles.pageInfo}>Página {currentPage} de {totalPages(filteredData.teachers)}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages(filteredData.teachers), p+1))} disabled={currentPage === totalPages(filteredData.teachers)} style={styles.pageButton}>Siguiente ▶</button>
                            </div>
                        )}
                    </>
                )}
                
                {activeTab === 'students' && (
                    <>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>ID Estudiante</th>
                                    <th style={styles.th}>Nombre Completo</th>
                                    <th style={styles.th}>Grado</th>
                                    <th style={styles.th}>Acudiente</th>
                                    <th style={styles.th}>Teléfono</th>
                                    <th style={styles.th}>Acciones</th>
                                 </tr>
                            </thead>
                            <tbody>
                                {getPaginatedData(filteredData.students).map(s => (
                                    <tr key={s._id} style={styles.tr}>
                                        <td style={styles.td}>{s.id_estudiante}</td>
                                        <td style={styles.td}><strong>{s.apellido1 || s.apellido || 'N/A'}</strong></td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.gradeBadge,
                                                backgroundColor: s.grado_especifico === '0°' ? '#27ae60' : ['1°','2°','3°','4°','5°'].includes(s.grado_especifico) ? '#2980b9' : '#8e44ad'
                                            }}>
                                                {formatGrado(s.grado_especifico)}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{s.nombre_acudiente || '-'}</td>
                                        <td style={styles.td}>{s.telefono || '-'}</td>
                                        <td style={styles.td}>
                                            <button style={styles.actionButton} onClick={() => openEditStudent(s)} title="Editar">✏️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredData.students.length > itemsPerPage && (
                            <div style={styles.pagination}>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} style={styles.pageButton}>◀ Anterior</button>
                                <span style={styles.pageInfo}>Página {currentPage} de {totalPages(filteredData.students)}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages(filteredData.students), p+1))} disabled={currentPage === totalPages(filteredData.students)} style={styles.pageButton}>Siguiente ▶</button>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Modal de Edición */}
            {showModal && (
                <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                {modalType === 'student' && 'Editar Estudiante'}
                                {modalType === 'teacher' && 'Editar Docente'}
                                {modalType === 'user' && 'Editar Usuario'}
                            </h3>
                            <button style={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div style={styles.modalContent}>
                            {modalType === 'student' && (
                                <>
                                    <div style={styles.formGroup}>
                                        <label>ID Estudiante</label>
                                        <input type="text" value={editForm.id_estudiante} onChange={(e) => setEditForm({...editForm, id_estudiante: e.target.value})} style={styles.input} readOnly />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Nombre Completo *</label>
                                        <input type="text" value={editForm.apellido1} onChange={(e) => setEditForm({...editForm, apellido1: e.target.value})} style={styles.input} required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Grado *</label>
                                        <select value={editForm.grado_especifico} onChange={(e) => setEditForm({...editForm, grado_especifico: e.target.value})} style={styles.select}>
                                            {gradosNumericos.filter(g => g !== 'todos').map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Nombre Acudiente</label>
                                        <input type="text" value={editForm.nombre_acudiente} onChange={(e) => setEditForm({...editForm, nombre_acudiente: e.target.value})} style={styles.input} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Cédula Acudiente</label>
                                        <input type="text" value={editForm.cedula_padre} onChange={(e) => setEditForm({...editForm, cedula_padre: e.target.value})} style={styles.input} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Parentesco</label>
                                        <select value={editForm.parentesco} onChange={(e) => setEditForm({...editForm, parentesco: e.target.value})} style={styles.select}>
                                            {parentescoOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Teléfono</label>
                                        <input type="text" value={editForm.telefono} onChange={(e) => setEditForm({...editForm, telefono: e.target.value})} style={styles.input} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Vereda</label>
                                        <input type="text" value={editForm.vereda} onChange={(e) => setEditForm({...editForm, vereda: e.target.value})} style={styles.input} />
                                    </div>
                                </>
                            )}
                            
                            {modalType === 'teacher' && (
                                <>
                                    <div style={styles.formGroup}>
                                        <label>Nombre Docente *</label>
                                        <input type="text" value={editForm.nombre} onChange={(e) => setEditForm({...editForm, nombre: e.target.value})} style={styles.input} required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Identificación</label>
                                        <input type="text" value={editForm.numeroIdentificacion} onChange={(e) => setEditForm({...editForm, numeroIdentificacion: e.target.value})} style={styles.input} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Cursos Asignados (separados por coma)</label>
                                        <input type="text" value={editForm.cursosAsignados} onChange={(e) => setEditForm({...editForm, cursosAsignados: e.target.value})} placeholder="Ej: 6°, 7°, 8°" style={styles.input} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Estado</label>
                                        <select value={editForm.activo} onChange={(e) => setEditForm({...editForm, activo: e.target.value === 'true'})} style={styles.select}>
                                            <option value={true}>Activo</option>
                                            <option value={false}>Inactivo</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            
                            {modalType === 'user' && (
                                <>
                                    <div style={styles.formGroup}>
                                        <label>Nombre *</label>
                                        <input type="text" value={editForm.nombre} onChange={(e) => setEditForm({...editForm, nombre: e.target.value})} style={styles.input} required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Identificación</label>
                                        <input type="text" value={editForm.numeroIdentificacion} onChange={(e) => setEditForm({...editForm, numeroIdentificacion: e.target.value})} style={styles.input} readOnly />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Email</label>
                                        <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} style={styles.input} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Teléfono</label>
                                        <input type="text" value={editForm.telefono} onChange={(e) => setEditForm({...editForm, telefono: e.target.value})} style={styles.input} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Rol</label>
                                        <select value={editForm.rol} onChange={(e) => setEditForm({...editForm, rol: e.target.value})} style={styles.select} disabled={editForm.rol === 'admin'}>
                                            <option value="admin">Administrador</option>
                                            <option value="directivo">Directivo</option>
                                            <option value="docente">Docente</option>
                                            <option value="acudiente">Acudiente</option>
                                        </select>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Estado</label>
                                        <select value={editForm.activo} onChange={(e) => setEditForm({...editForm, activo: e.target.value === 'true'})} style={styles.select}>
                                            <option value={true}>Activo</option>
                                            <option value={false}>Inactivo</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                        <div style={styles.modalFooter}>
                            <button style={styles.cancelButton} onClick={() => setShowModal(false)}>Cancelar</button>
                            <button style={styles.saveButton} onClick={handleSaveEdit} disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
    header: { marginBottom: '30px' },
    title: { margin: '0 0 5px 0', color: '#2c3e50', fontSize: '24px', fontWeight: '600' },
    subtitle: { margin: 0, color: '#7f8c8d', fontSize: '14px' },
    error: { padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px', textAlign: 'center' },
    retryButton: { padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' },
    statCard: { backgroundColor: '#2c3e50', color: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' },
    statValue: { display: 'block', fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' },
    statLabel: { fontSize: '12px', opacity: 0.9 },
    tabsContainer: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' },
    tab: { padding: '10px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '16px', color: '#7f8c8d', borderRadius: '5px 5px 0 0' },
    activeTab: { color: '#27ae60', borderBottom: '2px solid #27ae60', fontWeight: 'bold' },
    filtersContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    filterLabel: { fontWeight: 'bold', color: '#2c3e50', fontSize: '13px' },
    filterSelect: { padding: '10px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '14px', backgroundColor: 'white' },
    filterInput: { padding: '10px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '14px' },
    tableContainer: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #27ae60' },
    th: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontSize: '14px', fontWeight: 'bold' },
    tr: { borderBottom: '1px solid #ecf0f1' },
    td: { padding: '12px 15px', fontSize: '14px' },
    emailText: { color: '#7f8c8d', fontSize: '12px' },
    roleBadge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' },
    gradeBadge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' },
    statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' },
    actionButton: { margin: '0 5px', padding: '5px 10px', border: 'none', borderRadius: '3px', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '16px' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', padding: '20px' },
    pageButton: { padding: '8px 16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
    pageInfo: { color: '#2c3e50', fontSize: '14px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #ecf0f1', backgroundColor: '#f8f9fa' },
    modalTitle: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#2c3e50' },
    modalClose: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#7f8c8d' },
    modalContent: { padding: '20px', overflowY: 'auto' },
    modalFooter: { padding: '16px 20px', borderTop: '1px solid #ecf0f1', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    formGroup: { marginBottom: '15px' },
    input: { width: '100%', padding: '10px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' },
    select: { width: '100%', padding: '10px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '14px', backgroundColor: 'white' },
    cancelButton: { padding: '8px 16px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    saveButton: { padding: '8px 16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default AdminUserManagement;
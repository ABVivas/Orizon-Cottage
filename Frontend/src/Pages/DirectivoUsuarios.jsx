// Frontend/src/Pages/DirectivoUsuarios.jsx
import { useState, useEffect } from 'react';

const DirectivoUsuarios = () => {
    const [users, setUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Estados para filtros de usuarios
    const [filters, setFilters] = useState({
        rol: 'todos',
        estado: 'todos',
        busqueda: ''
    });
    
    // Estados para filtros de estudiantes
    const [studentFilters, setStudentFilters] = useState({
        grado: 'todos',
        busqueda: ''
    });
    
    // Estados para modal de edición
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalType, setModalType] = useState(''); // 'user', 'student'
    const [editForm, setEditForm] = useState({
        nombre: '',
        telefono: '',
        activo: true,
        cursosAsignados: '',
        estudiantesAsociados: [] // Para acudientes
    });
    const [studentEditForm, setStudentEditForm] = useState({
        apellido1: '',
        id_estudiante: '',
        grado_especifico: '',
        nombre_acudiente: '',
        cedula_padre: '',
        telefono: '',
        vereda: '',
        parentesco: 'PADRE'
    });
    
    // Estado para nuevo usuario/estudiante (unificado)
    const [newPersonForm, setNewPersonForm] = useState({
        tipo: 'acudiente', // 'acudiente', 'docente', 'directivo', 'estudiante'
        numeroIdentificacion: '',
        nombre: '',
        telefono: '',
        password: '',
        cursosAsignados: '',
        // Para estudiantes
        id_estudiante: '',
        grado_especifico: '0°',
        nombre_acudiente: '',
        cedula_padre: '',
        vereda: 'LA CABAÑA',
        parentesco: 'PADRE'
    });
    
    // Lista de estudiantes disponibles para asociar a acudientes
    const [availableStudents, setAvailableStudents] = useState([]);
    const [selectedStudentsForAcudiente, setSelectedStudentsForAcudiente] = useState([]);
    
    const [saving, setSaving] = useState(false);
    const [showNewPersonModal, setShowNewPersonModal] = useState(false);

    const grados = ['todos', '0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
    const parentescoOptions = ['PADRE', 'MADRE', 'ABUELO', 'TIO', 'OTRO'];

    useEffect(() => {
        fetchAllData();
        fetchAvailableStudents();
    }, []);

    useEffect(() => {
        applyFilters();
        setCurrentPage(1);
    }, [users, students, filters, studentFilters, activeTab]);

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
            
            const studentsRes = await fetch('http://localhost:5000/api/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const studentsData = await studentsRes.json();
            if (studentsData.success) {
                setStudents(studentsData.data || []);
            }
            
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAvailableStudents(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const applyFilters = () => {
        // Filtrar usuarios
        let filtered = [...users];
        
        if (filters.rol !== 'todos') {
            filtered = filtered.filter(u => u.rol === filters.rol);
        }
        
        if (filters.estado !== 'todos') {
            filtered = filtered.filter(u => u.activo === (filters.estado === 'activo'));
        }
        
        if (filters.busqueda) {
            const searchLower = filters.busqueda.toLowerCase();
            filtered = filtered.filter(u => 
                u.nombre?.toLowerCase().includes(searchLower) ||
                u.numeroIdentificacion?.includes(filters.busqueda)
            );
        }
        
        setFilteredUsers(filtered);
        
        // Filtrar estudiantes
        let filteredStud = [...students];
        
        if (studentFilters.grado !== 'todos') {
            filteredStud = filteredStud.filter(s => s.grado_especifico === studentFilters.grado);
        }
        
        if (studentFilters.busqueda) {
            const searchLower = studentFilters.busqueda.toLowerCase();
            filteredStud = filteredStud.filter(s => 
                s.apellido1?.toLowerCase().includes(searchLower) ||
                s.id_estudiante?.includes(studentFilters.busqueda) ||
                s.nombre_acudiente?.toLowerCase().includes(searchLower)
            );
        }
        
        setFilteredStudents(filteredStud);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleStudentFilterChange = (key, value) => {
        setStudentFilters(prev => ({ ...prev, [key]: value }));
    };

    const getAsignacionText = (user) => {
        if (user.rol === 'docente') {
            if (user.cursosAsignados && user.cursosAsignados.length > 0) {
                return user.cursosAsignados.join(', ');
            }
            return 'Sin grados asignados';
        }
        if (user.rol === 'acudiente') {
            if (user.estudiantesAsociados && user.estudiantesAsociados.length > 0) {
                return `${user.estudiantesAsociados.length} estudiante(s) asociado(s)`;
            }
            return 'Sin estudiantes asociados';
        }
        if (user.rol === 'directivo') {
            return 'Coordinación académica';
        }
        if (user.rol === 'admin') {
            return 'Administración del sistema';
        }
        if (user.rol === 'estudiante') {
            return 'Estudiante matriculado';
        }
        return '-';
    };

    const openEditUser = (user) => {
        setModalType('user');
        setSelectedItem(user);
        setEditForm({
            nombre: user.nombre || '',
            telefono: user.telefono || '',
            activo: user.activo !== undefined ? user.activo : true,
            cursosAsignados: user.cursosAsignados ? user.cursosAsignados.join(', ') : '',
            estudiantesAsociados: user.estudiantesAsociados || []
        });
        setSelectedStudentsForAcudiente(user.estudiantesAsociados?.map(s => s._id || s) || []);
        setShowModal(true);
    };

    const openEditStudent = (student) => {
        setModalType('student');
        setSelectedItem(student);
        setStudentEditForm({
            apellido1: student.apellido1 || student.apellido || '',
            id_estudiante: student.id_estudiante || '',
            grado_especifico: student.grado_especifico || student.grado || '0°',
            nombre_acudiente: student.nombre_acudiente || '',
            cedula_padre: student.cedula_padre || '',
            telefono: student.telefono || '',
            vereda: student.vereda || 'LA CABAÑA',
            parentesco: student.parentesco || 'PADRE'
        });
        setShowModal(true);
    };

    const openNewPersonModal = () => {
        setNewPersonForm({
            tipo: 'acudiente',
            numeroIdentificacion: '',
            nombre: '',
            telefono: '',
            password: '',
            cursosAsignados: '',
            id_estudiante: '',
            grado_especifico: '0°',
            nombre_acudiente: '',
            cedula_padre: '',
            vereda: 'LA CABAÑA',
            parentesco: 'PADRE'
        });
        setSelectedStudentsForAcudiente([]);
        setShowNewPersonModal(true);
    };

    const handleCreatePerson = async () => {
        // Validaciones básicas
        if (!newPersonForm.nombre) {
            alert('❌ El nombre es obligatorio');
            return;
        }
        
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            
            // Si es estudiante, crear en la colección students
            if (newPersonForm.tipo === 'estudiante') {
                if (!newPersonForm.id_estudiante) {
                    alert('❌ El ID del estudiante es obligatorio');
                    setSaving(false);
                    return;
                }
                
                const studentData = {
                    id_estudiante: newPersonForm.id_estudiante,
                    apellido1: newPersonForm.nombre,
                    grado_especifico: newPersonForm.grado_especifico,
                    nombre_acudiente: newPersonForm.nombre_acudiente,
                    cedula_padre: newPersonForm.cedula_padre,
                    telefono: newPersonForm.telefono,
                    vereda: newPersonForm.vereda,
                    parentesco: newPersonForm.parentesco,
                    grado: newPersonForm.grado_especifico === '0°' ? 'preescolar' : 
                            ['1°','2°','3°','4°','5°'].includes(newPersonForm.grado_especifico) ? 'primaria' : 'secundaria'
                };
                
                console.log('📝 Enviando datos estudiante:', studentData);
                
                const response = await fetch('http://localhost:5000/api/students', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(studentData)
                });
                
                console.log('📡 Status response:', response.status);
                
                // Verificar si la respuesta es JSON
                const text = await response.text();
                console.log('📡 Respuesta texto:', text);
                
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    throw new Error('La respuesta del servidor no es JSON válido. Verifica que el endpoint /api/students existe.');
                }
                
                if (response.ok && data.success) {
                    alert(`✅ Estudiante creado exitosamente\n\nID: ${newPersonForm.id_estudiante}\nNombre: ${newPersonForm.nombre}`);
                    setShowNewPersonModal(false);
                    fetchAllData();
                    fetchAvailableStudents();
                } else {
                    alert('❌ Error: ' + (data.message || 'No se pudo crear el estudiante'));
                }
            } else {
                // Crear usuario (acudiente, docente, directivo)
                if (!newPersonForm.numeroIdentificacion) {
                    alert('❌ El número de identificación es obligatorio');
                    setSaving(false);
                    return;
                }
                
                // Verificar si el usuario ya existe
                const checkUser = users.find(u => u.numeroIdentificacion === newPersonForm.numeroIdentificacion);
                if (checkUser) {
                    alert('❌ Ya existe un usuario con este número de identificación');
                    setSaving(false);
                    return;
                }
                
                const userData = {
                    numeroIdentificacion: newPersonForm.numeroIdentificacion,
                    nombre: newPersonForm.nombre,
                    telefono: newPersonForm.telefono || '',
                    rol: newPersonForm.tipo,
                    password: newPersonForm.password || '123456',
                    cursosAsignados: newPersonForm.cursosAsignados ? newPersonForm.cursosAsignados.split(',').map(c => c.trim()) : [],
                    estudiantesAsociados: selectedStudentsForAcudiente // Para acudientes
                };
                
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(userData)
                });
                
                const data = await response.json();
                if (data.success) {
                    alert(`✅ ${newPersonForm.tipo === 'docente' ? 'Docente' : newPersonForm.tipo === 'directivo' ? 'Directivo' : 'Acudiente'} creado exitosamente\n\nUsuario: ${newPersonForm.numeroIdentificacion}\nContraseña: ${newPersonForm.password || '123456'}`);
                    setShowNewPersonModal(false);
                    fetchAllData();
                } else {
                    alert('❌ Error: ' + (data.message || 'No se pudo crear el usuario'));
                }
            }
        } catch (error) {
            console.error('Error detallado:', error);
            alert('❌ Error de conexión: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveUser = async () => {
        if (!selectedItem) return;
        
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            
            const updateData = {
                nombre: editForm.nombre,
                telefono: editForm.telefono,
                activo: editForm.activo
            };
            
            if (selectedItem.rol === 'docente' && editForm.cursosAsignados) {
                updateData.cursosAsignados = editForm.cursosAsignados.split(',').map(c => c.trim());
            }
            
            if (selectedItem.rol === 'acudiente') {
                updateData.estudiantesAsociados = selectedStudentsForAcudiente;
            }
            
            const response = await fetch(`http://localhost:5000/api/users/${selectedItem._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });
            
            const data = await response.json();
            if (data.success) {
                alert('✅ Usuario actualizado correctamente');
                setShowModal(false);
                fetchAllData();
            } else {
                alert('❌ Error: ' + (data.message || 'No se pudo actualizar'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveStudent = async () => {
        if (!selectedItem) return;
        
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            
            const updateData = {
                apellido1: studentEditForm.apellido1,
                grado_especifico: studentEditForm.grado_especifico,
                nombre_acudiente: studentEditForm.nombre_acudiente,
                cedula_padre: studentEditForm.cedula_padre,
                telefono: studentEditForm.telefono,
                vereda: studentEditForm.vereda,
                parentesco: studentEditForm.parentesco
            };
            
            const response = await fetch(`http://localhost:5000/api/students/${selectedItem._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });
            
            const data = await response.json();
            if (data.success) {
                alert('✅ Estudiante actualizado correctamente');
                setShowModal(false);
                fetchAllData();
            } else {
                alert('❌ Error: ' + (data.message || 'No se pudo actualizar'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = () => {
        if (modalType === 'user') {
            handleSaveUser();
        } else {
            handleSaveStudent();
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
        if (!confirm(`¿Resetear contraseña para ${userName}?`)) return;
        
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

    const getRolColor = (rol) => {
        switch(rol) {
            case 'admin': return '#e74c3c';
            case 'directivo': return '#f39c12';
            case 'docente': return '#27ae60';
            case 'acudiente': return '#3498db';
            case 'estudiante': return '#9b59b6';
            default: return '#95a5a6';
        }
    };

    const getRolTexto = (rol) => {
        switch(rol) {
            case 'admin': return 'Administrador';
            case 'directivo': return 'Directivo';
            case 'docente': return 'Docente';
            case 'acudiente': return 'Acudiente';
            case 'estudiante': return 'Estudiante';
            default: return rol;
        }
    };

    const formatGrado = (grado) => {
        if (!grado) return 'N/A';
        if (grado.includes('°')) return grado;
        const gradoMap = { 
            'preescolar': '0°', 'primero': '1°', 'segundo': '2°', 'tercero': '3°',
            'cuarto': '4°', 'quinto': '5°', 'sexto': '6°', 'septimo': '7°',
            'octavo': '8°', 'noveno': '9°', 'decimo': '10°', 'once': '11°'
        };
        return gradoMap[grado.toLowerCase()] || grado;
    };

    // Paginación
    const currentData = activeTab === 'users' ? filteredUsers : filteredStudents;
    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    const paginatedData = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Función para manejar selección de estudiantes para acudiente
    const toggleStudentSelection = (studentId) => {
        setSelectedStudentsForAcudiente(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p>Cargando datos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <p>Error: {error}</p>
                <button onClick={fetchAllData} style={styles.retryButton}>Reintentar</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.headerSection}>
                <div>
                    <h2 style={styles.pageTitle}>Gestión de Usuarios</h2>
                    <p style={styles.pageSubtitle}>Administre usuarios, roles y estudiantes del sistema</p>
                </div>
                <button style={styles.addButton} onClick={openNewPersonModal}>
                    + Agregar Persona
                </button>
            </div>
            
            {/* Tabs */}
            <div style={styles.tabsContainer}>
                <button
                    style={{...styles.tab, ...(activeTab === 'users' && styles.activeTab)}}
                    onClick={() => { setActiveTab('users'); setCurrentPage(1); }}
                >
                    👥 Usuarios ({filteredUsers.length})
                </button>
                <button
                    style={{...styles.tab, ...(activeTab === 'students' && styles.activeTab)}}
                    onClick={() => { setActiveTab('students'); setCurrentPage(1); }}
                >
                    🧑‍🎓 Estudiantes ({filteredStudents.length})
                </button>
            </div>
            
            {/* Filtros para Usuarios */}
            {activeTab === 'users' && (
                <div style={styles.filtersCard}>
                    <div style={styles.filtersGrid}>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Rol</label>
                            <select 
                                value={filters.rol} 
                                onChange={(e) => handleFilterChange('rol', e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="todos">Todos los roles</option>
                                <option value="admin">Administradores</option>
                                <option value="directivo">Directivos</option>
                                <option value="docente">Docentes</option>
                                <option value="acudiente">Acudientes</option>
                                <option value="estudiante">Estudiantes</option>
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
                                value={filters.busqueda} 
                                onChange={(e) => handleFilterChange('busqueda', e.target.value)}
                                placeholder="Buscar por nombre o identificación..."
                                style={styles.filterInput}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Filtros para Estudiantes */}
            {activeTab === 'students' && (
                <div style={styles.filtersCard}>
                    <div style={styles.filtersGrid}>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Grado</label>
                            <select 
                                value={studentFilters.grado} 
                                onChange={(e) => handleStudentFilterChange('grado', e.target.value)}
                                style={styles.filterSelect}
                            >
                                {grados.map(g => (
                                    <option key={g} value={g}>{g === 'todos' ? 'Todos los grados' : g}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Buscar</label>
                            <input 
                                type="text" 
                                value={studentFilters.busqueda} 
                                onChange={(e) => handleStudentFilterChange('busqueda', e.target.value)}
                                placeholder="Buscar por nombre, ID o acudiente..."
                                style={styles.filterInput}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Tabla de Usuarios */}
            {activeTab === 'users' && (
                <div style={styles.tableCard}>
                    {paginatedData.length === 0 ? (
                        <p style={styles.emptyMessage}>No hay usuarios que coincidan con los filtros</p>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>Nombre</th>
                                    <th style={styles.th}>Identificación</th>
                                    <th style={styles.th}>Rol</th>
                                    <th style={styles.th}>Asignación</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Acciones</th>
                                  </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map(user => (
                                    <tr key={user._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <strong>{user.nombre}</strong>
                                            <br />
                                            <small style={styles.emailText}>{user.telefono || ''}</small>
                                        </td>
                                        <td style={styles.td}>{user.numeroIdentificacion}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.roleBadge,
                                                backgroundColor: getRolColor(user.rol)
                                            }}>
                                                {getRolTexto(user.rol)}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <small>{getAsignacionText(user)}</small>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.estadoBadge,
                                                backgroundColor: user.activo ? '#27ae60' : '#e74c3c'
                                            }}>
                                                {user.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button 
                                                style={styles.editButton}
                                                onClick={() => openEditUser(user)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                style={styles.statusButton}
                                                onClick={() => toggleUserStatus(user._id, user.activo)}
                                                title={user.activo ? 'Desactivar' : 'Activar'}
                                            >
                                                {user.activo ? '🔒' : '🔓'}
                                            </button>
                                            <button 
                                                style={styles.resetButton}
                                                onClick={() => resetUserPassword(user._id, user.nombre)}
                                                title="Resetear contraseña"
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
            )}
            
            {/* Tabla de Estudiantes con botón de edición */}
            {activeTab === 'students' && (
                <div style={styles.tableCard}>
                    {paginatedData.length === 0 ? (
                        <p style={styles.emptyMessage}>No hay estudiantes que coincidan con los filtros</p>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>ID Estudiante</th>
                                    <th style={styles.th}>Nombre Completo</th>
                                    <th style={styles.th}>Grado</th>
                                    <th style={styles.th}>Acudiente</th>
                                    <th style={styles.th}>Teléfono</th>
                                    <th style={styles.th}>Vereda</th>
                                    <th style={styles.th}>Acciones</th>
                                  </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map(student => (
                                    <tr key={student._id} style={styles.tr}>
                                        <td style={styles.td}>{student.id_estudiante}</td>
                                        <td style={styles.td}>
                                            <strong>{student.apellido1 || student.apellido || 'N/A'}</strong>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.gradeBadge,
                                                backgroundColor: student.grado_especifico === '0°' ? '#27ae60' :
                                                                ['1°','2°','3°','4°','5°'].includes(student.grado_especifico) ? '#2980b9' : '#8e44ad'
                                            }}>
                                                {formatGrado(student.grado_especifico)}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{student.nombre_acudiente || '-'}</td>
                                        <td style={styles.td}>{student.telefono || '-'}</td>
                                        <td style={styles.td}>{student.vereda || '-'}</td>
                                        <td style={styles.td}>
                                            <button 
                                                style={styles.editButton}
                                                onClick={() => openEditStudent(student)}
                                                title="Editar estudiante"
                                            >
                                                ✏️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
            
            {/* Paginación */}
            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={styles.pageButton}
                    >
                        Anterior
                    </button>
                    <span style={styles.pageInfo}>
                        Página {currentPage} de {totalPages} ({currentData.length} registros)
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={styles.pageButton}
                    >
                        Siguiente
                    </button>
                </div>
            )}
            
            {/* Modal de Edición */}
            {showModal && (
                <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                {modalType === 'user' ? 'Editar Usuario' : 'Editar Estudiante'}
                            </h3>
                            <button style={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
                        </div>
                        
                        <div style={styles.modalContent}>
                            {modalType === 'user' && selectedItem && (
                                <>
                                    <div style={styles.infoBox}>
                                        <p><strong>ID:</strong> {selectedItem.numeroIdentificacion}</p>
                                        <p><strong>Rol:</strong> {getRolTexto(selectedItem.rol)}</p>
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={editForm.nombre}
                                            onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                                            style={styles.input}
                                        />
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Teléfono</label>
                                        <input
                                            type="text"
                                            value={editForm.telefono}
                                            onChange={(e) => setEditForm({...editForm, telefono: e.target.value})}
                                            style={styles.input}
                                            placeholder="Opcional"
                                        />
                                    </div>
                                    
                                    {selectedItem.rol === 'docente' && (
                                        <div style={styles.formGroup}>
                                            <label style={styles.modalLabel}>Cursos Asignados</label>
                                            <input
                                                type="text"
                                                value={editForm.cursosAsignados}
                                                onChange={(e) => setEditForm({...editForm, cursosAsignados: e.target.value})}
                                                style={styles.input}
                                                placeholder="Ej: 6°, 7°, 8°"
                                            />
                                            <small style={styles.helpText}>Separe los cursos con comas</small>
                                        </div>
                                    )}
                                    
                                    {selectedItem.rol === 'acudiente' && (
                                        <div style={styles.formGroup}>
                                            <label style={styles.modalLabel}>Estudiantes Asociados</label>
                                            <div style={styles.studentsListContainer}>
                                                {availableStudents.length === 0 ? (
                                                    <p style={styles.noStudentsText}>No hay estudiantes disponibles</p>
                                                ) : (
                                                    availableStudents.map(student => (
                                                        <label key={student._id} style={styles.checkboxLabel}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedStudentsForAcudiente.includes(student._id)}
                                                                onChange={() => toggleStudentSelection(student._id)}
                                                            />
                                                            {student.apellido1 || student.apellido} - {student.grado_especifico} ({student.id_estudiante})
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                            <small style={styles.helpText}>Seleccione los estudiantes asociados a este acudiente</small>
                                        </div>
                                    )}
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Estado</label>
                                        <select
                                            value={editForm.activo}
                                            onChange={(e) => setEditForm({...editForm, activo: e.target.value === 'true'})}
                                            style={styles.select}
                                        >
                                            <option value={true}>Activo</option>
                                            <option value={false}>Inactivo</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            
                            {modalType === 'student' && selectedItem && (
                                <>
                                    <div style={styles.infoBox}>
                                        <p><strong>ID Estudiante:</strong> {studentEditForm.id_estudiante}</p>
                                        <p><strong>Estudiante:</strong> {studentEditForm.apellido1}</p>
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Nombre Completo *</label>
                                        <input
                                            type="text"
                                            value={studentEditForm.apellido1}
                                            onChange={(e) => setStudentEditForm({...studentEditForm, apellido1: e.target.value})}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Grado *</label>
                                        <select
                                            value={studentEditForm.grado_especifico}
                                            onChange={(e) => setStudentEditForm({...studentEditForm, grado_especifico: e.target.value})}
                                            style={styles.select}
                                        >
                                            {grados.filter(g => g !== 'todos').map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Nombre Acudiente</label>
                                        <input
                                            type="text"
                                            value={studentEditForm.nombre_acudiente}
                                            onChange={(e) => setStudentEditForm({...studentEditForm, nombre_acudiente: e.target.value})}
                                            style={styles.input}
                                        />
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Cédula Acudiente</label>
                                        <input
                                            type="text"
                                            value={studentEditForm.cedula_padre}
                                            onChange={(e) => setStudentEditForm({...studentEditForm, cedula_padre: e.target.value})}
                                            style={styles.input}
                                        />
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Parentesco</label>
                                        <select
                                            value={studentEditForm.parentesco}
                                            onChange={(e) => setStudentEditForm({...studentEditForm, parentesco: e.target.value})}
                                            style={styles.select}
                                        >
                                            {parentescoOptions.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Teléfono</label>
                                        <input
                                            type="text"
                                            value={studentEditForm.telefono}
                                            onChange={(e) => setStudentEditForm({...studentEditForm, telefono: e.target.value})}
                                            style={styles.input}
                                        />
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Vereda</label>
                                        <input
                                            type="text"
                                            value={studentEditForm.vereda}
                                            onChange={(e) => setStudentEditForm({...studentEditForm, vereda: e.target.value})}
                                            style={styles.input}
                                            placeholder="Ej: LA CABAÑA"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div style={styles.modalFooter}>
                            <button style={styles.cancelButton} onClick={() => setShowModal(false)}>
                                Cancelar
                            </button>
                            <button style={styles.saveButton} onClick={handleSaveEdit} disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal para agregar nueva persona */}
            {showNewPersonModal && (
                <div style={styles.modalOverlay} onClick={() => setShowNewPersonModal(false)}>
                    <div style={{...styles.modal, maxWidth: '650px'}} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Agregar Persona</h3>
                            <button style={styles.modalClose} onClick={() => setShowNewPersonModal(false)}>×</button>
                        </div>
                        
                        <div style={styles.modalContent}>
                            <div style={styles.formGroup}>
                                <label style={styles.modalLabel}>Tipo de Persona *</label>
                                <select
                                    value={newPersonForm.tipo}
                                    onChange={(e) => {
                                        setNewPersonForm({...newPersonForm, tipo: e.target.value});
                                        setSelectedStudentsForAcudiente([]);
                                    }}
                                    style={styles.select}
                                >
                                    <option value="acudiente">Acudiente</option>
                                    <option value="docente">Docente</option>
                                    <option value="directivo">Directivo</option>
                                    <option value="estudiante">Estudiante</option>
                                </select>
                            </div>
                            
                            {newPersonForm.tipo !== 'estudiante' && (
                                <>
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Número de Identificación *</label>
                                        <input
                                            type="text"
                                            value={newPersonForm.numeroIdentificacion}
                                            onChange={(e) => setNewPersonForm({...newPersonForm, numeroIdentificacion: e.target.value})}
                                            style={styles.input}
                                            placeholder="Ej: 123456789"
                                        />
                                    </div>
                                </>
                            )}
                            
                            {newPersonForm.tipo === 'estudiante' && (
                                <div style={styles.formGroup}>
                                    <label style={styles.modalLabel}>ID Estudiante *</label>
                                    <input
                                        type="text"
                                        value={newPersonForm.id_estudiante}
                                        onChange={(e) => setNewPersonForm({...newPersonForm, id_estudiante: e.target.value})}
                                        style={styles.input}
                                        placeholder="Ej: 1063819482"
                                    />
                                </div>
                            )}
                            
                            <div style={styles.formGroup}>
                                <label style={styles.modalLabel}>Nombre Completo *</label>
                                <input
                                    type="text"
                                    value={newPersonForm.nombre}
                                    onChange={(e) => setNewPersonForm({...newPersonForm, nombre: e.target.value})}
                                    style={styles.input}
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                            
                            {newPersonForm.tipo === 'docente' && (
                                <div style={styles.formGroup}>
                                    <label style={styles.modalLabel}>Cursos Asignados (separados por coma)</label>
                                    <input
                                        type="text"
                                        value={newPersonForm.cursosAsignados}
                                        onChange={(e) => setNewPersonForm({...newPersonForm, cursosAsignados: e.target.value})}
                                        style={styles.input}
                                        placeholder="Ej: 6°, 7°, 8°"
                                    />
                                    <small style={styles.helpText}>Separe los cursos con comas</small>
                                </div>
                            )}
                            
                            {newPersonForm.tipo === 'acudiente' && (
                                <div style={styles.formGroup}>
                                    <label style={styles.modalLabel}>Estudiantes Asociados</label>
                                    <div style={styles.studentsListContainer}>
                                        {availableStudents.length === 0 ? (
                                            <p style={styles.noStudentsText}>No hay estudiantes disponibles. Primero agregue estudiantes.</p>
                                        ) : (
                                            availableStudents.map(student => (
                                                <label key={student._id} style={styles.checkboxLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudentsForAcudiente.includes(student._id)}
                                                        onChange={() => toggleStudentSelection(student._id)}
                                                    />
                                                    {student.apellido1 || student.apellido} - {student.grado_especifico} ({student.id_estudiante})
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    <small style={styles.helpText}>Seleccione los estudiantes asociados a este acudiente</small>
                                </div>
                            )}
                            
                            {newPersonForm.tipo === 'estudiante' && (
                                <>
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Grado *</label>
                                        <select
                                            value={newPersonForm.grado_especifico}
                                            onChange={(e) => setNewPersonForm({...newPersonForm, grado_especifico: e.target.value})}
                                            style={styles.select}
                                        >
                                            {grados.filter(g => g !== 'todos').map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Nombre Acudiente</label>
                                        <input
                                            type="text"
                                            value={newPersonForm.nombre_acudiente}
                                            onChange={(e) => setNewPersonForm({...newPersonForm, nombre_acudiente: e.target.value})}
                                            style={styles.input}
                                            placeholder="Nombre del acudiente"
                                        />
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Cédula Acudiente</label>
                                        <input
                                            type="text"
                                            value={newPersonForm.cedula_padre}
                                            onChange={(e) => setNewPersonForm({...newPersonForm, cedula_padre: e.target.value})}
                                            style={styles.input}
                                            placeholder="Cédula del acudiente"
                                        />
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Parentesco</label>
                                        <select
                                            value={newPersonForm.parentesco}
                                            onChange={(e) => setNewPersonForm({...newPersonForm, parentesco: e.target.value})}
                                            style={styles.select}
                                        >
                                            {parentescoOptions.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.modalLabel}>Vereda</label>
                                        <input
                                            type="text"
                                            value={newPersonForm.vereda}
                                            onChange={(e) => setNewPersonForm({...newPersonForm, vereda: e.target.value})}
                                            style={styles.input}
                                            placeholder="Ej: LA CABAÑA"
                                        />
                                    </div>
                                </>
                            )}
                            
                            <div style={styles.formGroup}>
                                <label style={styles.modalLabel}>Teléfono (opcional)</label>
                                <input
                                    type="text"
                                    value={newPersonForm.telefono}
                                    onChange={(e) => setNewPersonForm({...newPersonForm, telefono: e.target.value})}
                                    style={styles.input}
                                    placeholder="Ej: 3001234567"
                                />
                            </div>
                            
                            {newPersonForm.tipo !== 'estudiante' && (
                                <div style={styles.formGroup}>
                                    <label style={styles.modalLabel}>Contraseña (dejar vacío para usar 123456)</label>
                                    <input
                                        type="text"
                                        value={newPersonForm.password}
                                        onChange={(e) => setNewPersonForm({...newPersonForm, password: e.target.value})}
                                        style={styles.input}
                                        placeholder="Contraseña temporal"
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div style={styles.modalFooter}>
                            <button style={styles.cancelButton} onClick={() => setShowNewPersonModal(false)}>
                                Cancelar
                            </button>
                            <button style={styles.saveButton} onClick={handleCreatePerson} disabled={saving}>
                                {saving ? 'Creando...' : 'Crear Persona'}
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
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    headerSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
    },
    pageTitle: {
        margin: '0 0 5px 0',
        fontSize: '24px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    pageSubtitle: {
        margin: '0',
        fontSize: '14px',
        color: '#7f8c8d'
    },
    addButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        transition: 'all 0.2s'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
    },
    loadingSpinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #27ae60',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '15px'
    },
    errorContainer: {
        textAlign: 'center',
        padding: '50px'
    },
    retryButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '15px'
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
        fontSize: '15px',
        color: '#7f8c8d',
        borderRadius: '5px 5px 0 0'
    },
    activeTab: {
        color: '#27ae60',
        borderBottom: '2px solid #27ae60',
        fontWeight: 'bold'
    },
    filtersCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '20px',
        marginBottom: '24px'
    },
    filtersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    filterLabel: {
        fontWeight: '600',
        color: '#2c3e50',
        fontSize: '13px'
    },
    filterSelect: {
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    filterInput: {
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '6px',
        fontSize: '14px'
    },
    tableCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
        fontWeight: '600'
    },
    tr: {
        borderBottom: '1px solid #ecf0f1'
    },
    td: {
        padding: '12px 15px',
        fontSize: '14px',
        verticalAlign: 'middle'
    },
    emailText: {
        color: '#7f8c8d',
        fontSize: '11px'
    },
    roleBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
    },
    estadoBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
    },
    gradeBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
    },
    editButton: {
        padding: '6px 12px',
        marginRight: '5px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#f39c12',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px'
    },
    statusButton: {
        padding: '6px 12px',
        marginRight: '5px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#3498db',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px'
    },
    resetButton: {
        padding: '6px 12px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#27ae60',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px'
    },
    emptyMessage: {
        textAlign: 'center',
        padding: '40px',
        color: '#95a5a6'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        marginTop: '20px',
        padding: '15px'
    },
    pageButton: {
        padding: '8px 16px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    pageInfo: {
        color: '#2c3e50',
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
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px'
    },
    infoBox: {
        backgroundColor: '#f8f9fa',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px'
    },
    formGroup: {
        marginBottom: '15px'
    },
    modalLabel: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: '600',
        color: '#2c3e50',
        fontSize: '13px'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #dcdfe6',
        borderRadius: '6px',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    select: {
        width: '100%',
        padding: '10px',
        border: '1px solid #dcdfe6',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    studentsListContainer: {
        border: '1px solid #dcdfe6',
        borderRadius: '6px',
        padding: '10px',
        maxHeight: '200px',
        overflowY: 'auto',
        backgroundColor: '#fafafa'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 0',
        cursor: 'pointer',
        fontSize: '13px'
    },
    noStudentsText: {
        textAlign: 'center',
        color: '#95a5a6',
        padding: '20px',
        fontSize: '13px'
    },
    helpText: {
        fontSize: '11px',
        color: '#7f8c8d',
        marginTop: '4px',
        display: 'block'
    },
    cancelButton: {
        padding: '8px 16px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    saveButton: {
        padding: '8px 16px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    }
};

// Animación para el spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default DirectivoUsuarios;
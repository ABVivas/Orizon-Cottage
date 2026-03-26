// Frontend/src/Pages/AdminUserManagement.jsx
import { useState, useEffect } from 'react';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [filteredData, setFilteredData] = useState({ users: [], teachers: [], students: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [filters, setFilters] = useState({ rol: 'todos', estado: 'todos', search: '', grado: 'todos', codigo: '', asignatura: 'todos' });
    const [stats, setStats] = useState({ totalUsers: 0, totalTeachers: 0, totalStudents: 0, activos: 0, inactivos: 0, docentes: 0, acudientes: 0, directivos: 0, admins: 0, preescolar: 0, primaria: 0, secundaria: 0 });

    const formatGrado = (grado) => {
        if (!grado) return '';
        if (grado.includes('°')) return grado;
        const gradoMap = { 'preescolar': '0°', 'primero': '1°', 'segundo': '2°', 'tercero': '3°', 'cuarto': '4°', 'quinto': '5°', 'sexto': '6°', 'septimo': '7°', 'octavo': '8°', 'noveno': '9°', 'decimo': '10°', 'once': '11°' };
        return gradoMap[grado.toLowerCase()] || grado;
    };

    const getUniqueTeachers = (teachersList) => {
        const uniqueMap = new Map();
        teachersList.forEach(teacher => { if (!uniqueMap.has(teacher.docente)) uniqueMap.set(teacher.docente, teacher); });
        return Array.from(uniqueMap.values());
    };

    useEffect(() => { fetchAllData(); }, []);
    useEffect(() => { applyFilters(); calculateStats(); }, [users, teachers, students, filters, activeTab]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const usersRes = await fetch('http://localhost:5000/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
            const usersData = await usersRes.json();
            if (usersData.success) setUsers(usersData.users || []);

            const teachersRes = await fetch('http://localhost:5000/api/teachers', { headers: { 'Authorization': `Bearer ${token}` } });
            const teachersData = await teachersRes.json();
            if (teachersData.success) setTeachers(getUniqueTeachers(teachersData.data || []));

            const studentsRes = await fetch('http://localhost:5000/api/students', { headers: { 'Authorization': `Bearer ${token}` } });
            const studentsData = await studentsRes.json();
            if (studentsData.success) setStudents(studentsData.data || []);
        } catch (error) { setError(error.message); }
        finally { setLoading(false); }
    };

    const calculateStats = () => {
        setStats({
            totalUsers: users.length, totalTeachers: teachers.length, totalStudents: students.length,
            activos: users.filter(u => u.activo).length + teachers.length, inactivos: users.filter(u => !u.activo).length,
            docentes: teachers.length, acudientes: users.filter(u => u.rol === 'acudiente').length,
            directivos: users.filter(u => u.rol === 'directivo').length, admins: users.filter(u => u.rol === 'admin').length,
            preescolar: students.filter(s => s.grado_especifico === '0°').length,
            primaria: students.filter(s => ['1°','2°','3°','4°','5°'].includes(s.grado_especifico)).length,
            secundaria: students.filter(s => ['6°','7°','8°','9°','10°','11°'].includes(s.grado_especifico)).length
        });
    };

    const applyFilters = () => {
        let filteredUsers = [...users];
        if (filters.rol !== 'todos') filteredUsers = filteredUsers.filter(u => u.rol === filters.rol);
        if (filters.estado !== 'todos') filteredUsers = filteredUsers.filter(u => u.activo === (filters.estado === 'activo'));
        if (filters.search) filteredUsers = filteredUsers.filter(u => u.nombre?.toLowerCase().includes(filters.search.toLowerCase()));

        let filteredTeachers = [...teachers];
        if (filters.codigo) filteredTeachers = filteredTeachers.filter(t => t.id_docente?.toString().includes(filters.codigo));
        if (filters.asignatura !== 'todos') filteredTeachers = filteredTeachers.filter(t => t.asignatura === filters.asignatura);
        if (filters.search) filteredTeachers = filteredTeachers.filter(t => t.docente?.toLowerCase().includes(filters.search.toLowerCase()));

        let filteredStudents = [...students];
        if (activeTab === 'students') {
            if (filters.grado !== 'todos') filteredStudents = filteredStudents.filter(s => s.grado_especifico === formatGrado(filters.grado));
            if (filters.search) filteredStudents = filteredStudents.filter(s => s.apellido1?.toLowerCase().includes(filters.search.toLowerCase()) || s.id_estudiante?.includes(filters.search));
        }
        setFilteredData({ users: filteredUsers, teachers: filteredTeachers, students: filteredStudents });
    };

    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

    const gradosNumericos = ['todos', '0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
    const asignaturas = ['todos', ...new Set(teachers.map(t => t.asignatura).filter(Boolean))];

    if (loading) return <div style={styles.container}><h2 style={styles.title}>Gestión de Usuarios</h2><p>Cargando datos...</p></div>;
    if (error) return <div style={styles.container}><h2 style={styles.title}>Gestión de Usuarios</h2><div style={styles.error}><p>{error}</p><button onClick={fetchAllData} style={styles.retryButton}>Reintentar</button></div></div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}><h2 style={styles.title}>Gestión de Usuarios</h2><p style={styles.subtitle}>Administre usuarios, roles y estudiantes del sistema</p></div>
            <div style={styles.statsGrid}>
                <div style={styles.statCard} onClick={() => setActiveTab('users')}><span style={styles.statValue}>{stats.totalUsers}</span><span style={styles.statLabel}>Usuarios</span></div>
                <div style={styles.statCard} onClick={() => setActiveTab('teachers')}><span style={styles.statValue}>{stats.totalTeachers}</span><span style={styles.statLabel}>Docentes</span></div>
                <div style={styles.statCard} onClick={() => setActiveTab('students')}><span style={styles.statValue}>{stats.totalStudents}</span><span style={styles.statLabel}>Estudiantes</span></div>
                <div style={{...styles.statCard, backgroundColor: '#27ae60'}}><span style={styles.statValue}>{stats.activos}</span><span style={styles.statLabel}>Activos</span></div>
                <div style={{...styles.statCard, backgroundColor: '#3498db'}}><span style={styles.statValue}>{stats.docentes}</span><span style={styles.statLabel}>Docentes</span></div>
                <div style={{...styles.statCard, backgroundColor: '#f39c12'}}><span style={styles.statValue}>{stats.acudientes}</span><span style={styles.statLabel}>Acudientes</span></div>
            </div>
            <div style={styles.tabsContainer}>
                <button style={{...styles.tab, ...(activeTab === 'users' && styles.activeTab)}} onClick={() => setActiveTab('users')}>👥 Usuarios ({filteredData.users.length})</button>
                <button style={{...styles.tab, ...(activeTab === 'teachers' && styles.activeTab)}} onClick={() => setActiveTab('teachers')}>👨‍🏫 Docentes ({filteredData.teachers.length})</button>
                <button style={{...styles.tab, ...(activeTab === 'students' && styles.activeTab)}} onClick={() => setActiveTab('students')}>🧑‍🎓 Estudiantes ({filteredData.students.length})</button>
            </div>
            <div style={styles.filtersContainer}>
                {activeTab === 'users' && <>
                    <div style={styles.filterGroup}><label style={styles.filterLabel}>Rol</label><select value={filters.rol} onChange={(e) => handleFilterChange('rol', e.target.value)} style={styles.filterSelect}>
                        <option value="todos">Todos</option><option value="acudiente">Acudientes</option><option value="directivo">Directivos</option><option value="admin">Administradores</option>
                    </select></div>
                    <div style={styles.filterGroup}><label style={styles.filterLabel}>Estado</label><select value={filters.estado} onChange={(e) => handleFilterChange('estado', e.target.value)} style={styles.filterSelect}>
                        <option value="todos">Todos</option><option value="activo">Activo</option><option value="inactivo">Inactivo</option>
                    </select></div>
                </>}
                {activeTab === 'teachers' && <>
                    <div style={styles.filterGroup}><label style={styles.filterLabel}>Código</label><input type="text" value={filters.codigo} onChange={(e) => handleFilterChange('codigo', e.target.value)} placeholder="Filtrar por código..." style={styles.filterInput} /></div>
                    <div style={styles.filterGroup}><label style={styles.filterLabel}>Asignatura</label><select value={filters.asignatura} onChange={(e) => handleFilterChange('asignatura', e.target.value)} style={styles.filterSelect}>
                        <option value="todos">Todas</option>{asignaturas.filter(a => a !== 'todos').map(asig => <option key={asig} value={asig}>{asig}</option>)}
                    </select></div>
                    <div style={styles.filterGroup}><label style={styles.filterLabel}>Buscar</label><input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Buscar por nombre..." style={styles.filterInput} /></div>
                </>}
                {activeTab === 'students' && <>
                    <div style={styles.filterGroup}><label style={styles.filterLabel}>Grado</label><select value={filters.grado} onChange={(e) => handleFilterChange('grado', e.target.value)} style={styles.filterSelect}>
                        {gradosNumericos.map(g => <option key={g} value={g}>{g === 'todos' ? 'Todos los grados' : g}</option>)}
                    </select></div>
                    <div style={styles.filterGroup}><label style={styles.filterLabel}>Buscar</label><input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Buscar por nombre, ID o acudiente..." style={styles.filterInput} /></div>
                </>}
            </div>
            <div style={styles.tableContainer}>
                {activeTab === 'users' && <table style={styles.table}><thead><tr style={styles.tableHeader}><th style={styles.th}>Nombre</th><th style={styles.th}>Identificación</th><th style={styles.th}>Rol</th><th style={styles.th}>Estado</th><th style={styles.th}>Acciones</th> </tr></thead>
                <tbody>{filteredData.users.map(u => <tr key={u._id} style={styles.tr}><td style={styles.td}><strong>{u.nombre}</strong><br /><small>{u.email || ''}</small></td><td style={styles.td}>{u.numeroIdentificacion}</td>
                <td style={styles.td}><span style={{...styles.roleBadge, backgroundColor: u.rol === 'admin' ? '#e74c3c' : u.rol === 'directivo' ? '#f39c12' : '#27ae60'}}>{u.rol}</span></td>
                <td style={styles.td}><span style={{...styles.statusBadge, backgroundColor: u.activo ? '#27ae60' : '#e74c3c', color: 'white'}}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td style={styles.td}><button style={styles.actionButton}>🔒</button><button style={styles.actionButton}>🔑</button></td></tr>)}</tbody></table>}
                {activeTab === 'teachers' && <table style={styles.table}><thead><tr style={styles.tableHeader}><th style={styles.th}>Código</th><th style={styles.th}>Docente</th><th style={styles.th}>Asignatura</th><th style={styles.th}>Grados</th> </tr></thead>
                <tbody>{filteredData.teachers.map(t => <tr key={t._id} style={styles.tr}><td style={styles.td}><strong>{t.id_docente || t.no || 'N/A'}</strong></td><td style={styles.td}><strong>{t.docente}</strong></td><td style={styles.td}>{t.asignatura}</td><td style={styles.td}>{t.grados}</td></tr>)}</tbody></table>}
                {activeTab === 'students' && <table style={styles.table}><thead><tr style={styles.tableHeader}><th style={styles.th}>ID Estudiante</th><th style={styles.th}>Nombre Completo</th><th style={styles.th}>Grado</th><th style={styles.th}>Acudiente</th><th style={styles.th}>Teléfono</th> </tr></thead>
                <tbody>{filteredData.students.map(s => <tr key={s._id} style={styles.tr}><td style={styles.td}>{s.id_estudiante}</td><td style={styles.td}><strong>{s.apellido1 || s.apellido || 'N/A'}</strong></td>
                <td style={styles.td}><span style={{...styles.gradeBadge, backgroundColor: s.grado_especifico === '0°' ? '#27ae60' : ['1°','2°','3°','4°','5°'].includes(s.grado_especifico) ? '#2980b9' : '#8e44ad'}}>{formatGrado(s.grado_especifico)}</span></td>
                <td style={styles.td}>{s.nombre_acudiente || '-'}</td><td style={styles.td}>{s.telefono || '-'}</td></tr>)}</tbody></table>}
            </div>
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
    emptyMessage: { textAlign: 'center', padding: '40px', color: '#95a5a6' }
};

export default AdminUserManagement;
// Frontend/src/App.jsx
import { useState, useEffect } from 'react';
import Login from './Pages/Login';
import AdminDashboard from './Pages/AdminDashboard';
// Importaremos los otros dashboards cuando los creemos
// import DirectivoDashboard from './Pages/DirectivoDashboard';
// import DocenteDashboard from './Pages/DocenteDashboard';
// import AcudienteDashboard from './Pages/AcudienteDashboard';

function App() {
    const [apiUrl] = useState('http://localhost:5000/api');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Agregar estilos globales verdes al cargar la app
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            input:focus, select:focus, textarea:focus, button:focus {
                border-color: #27ae60 !important;
                box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.2) !important;
                outline: none !important;
            }
            
            button:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
            }
            
            .logout-btn:hover {
                background-color: #c0392b !important;
            }
            
            .action-btn:hover {
                background-color: #27ae60 !important;
                color: white !important;
            }
            
            .filter-btn:hover {
                background-color: #27ae20 !important;
                color: white !important;
            }
            
            ::selection {
                background-color: #27ae60;
                color: white;
            }
            
            /* Scrollbar verde */
            ::-webkit-scrollbar-thumb {
                background-color: #27ae60;
                border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background-color: #219a52;
            }

            /* Estilos para las tablas */
            .table-container {
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow-x: auto;
                margin-top: 20px;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
            }
            
            th {
                background-color: #27ae60;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: bold;
                font-size: 14px;
            }
            
            td {
                padding: 12px 15px;
                text-align: left;
                font-size: 14px;
                border-bottom: 1px solid #ecf0f1;
            }
            
            tr:hover {
                background-color: #f5f5f5;
            }
            
            .grade-badge {
                padding: 4px 10px;
                border-radius: 20px;
                color: white;
                font-size: 12px;
                font-weight: bold;
            }
            
            .grade-preescolar { background-color: #27ae60; }
            .grade-primaria { background-color: #2980b9; }
            .grade-secundaria { background-color: #8e44ad; }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Verificar si hay token al cargar la app
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
            setIsAuthenticated(true);
            setUser(JSON.parse(savedUser));
        }
    }, []);

    // Cargar estudiantes cuando se autentique (solo para la vista antigua)
    useEffect(() => {
        if (isAuthenticated && user?.rol === 'admin') {
            // Solo cargamos estudiantes si es admin y estamos en la vista antigua
            // Esto se puede eliminar cuando migremos completamente
            getStudents();
        }
    }, [isAuthenticated, user]);

    // Función para obtener todos los estudiantes
    async function getStudents() {
        setError('');
        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('No hay sesión activa. Por favor inicie sesión.');
                setLoading(false);
                return;
            }

            console.log('Obteniendo estudiantes de:', `${apiUrl}/students`);
            const response = await fetch(`${apiUrl}/students`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 401) {
                // Token expirado o inválido
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setError('Sesión expirada. Por favor inicie sesión nuevamente.');
                setLoading(false);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Estudiantes recibidos:', data);
            
            if (data.success) {
                setStudents(data.data);
                setMessage(`✅ ${data.count} estudiantes cargados`);
            } else {
                setError('❌ Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('❌ Error al obtener estudiantes:', error);
            setError(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    // Función para probar la conexión
    async function testConnection() {
        setError('');
        setMessage('Probando conexión...');
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/test`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            
            const data = await response.json();
            console.log('✅ Datos recibidos:', data);
            setMessage(`✅ Conexión exitosa: ${data.message}`);
        } catch (error) {
            console.error('❌ Error detallado:', error);
            setError(`❌ Error: ${error.message}`);
            setMessage('');
        }
    }

    // Función para obtener estudiantes por grado
    async function getStudentsByGrade(grade) {
        setError('');
        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('No hay sesión activa');
                setLoading(false);
                return;
            }

            const url = grade === 'todos' 
                ? `${apiUrl}/students`
                : `${apiUrl}/students/grade/${grade}`;
            
            console.log('Obteniendo estudiantes de:', url);
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Estudiantes recibidos:', data);
            
            if (data.success) {
                setStudents(data.data);
                setMessage(`✅ ${data.count} estudiantes ${grade !== 'todos' ? 'de ' + grade : ''}`);
            }
        } catch (error) {
            console.error('❌ Error al filtrar por grado:', error);
            setError(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    const handleLogin = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setStudents([]);
        setMessage('');
        setError('');
    };

    // Si no está autenticado, mostrar login
    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    // Estilo para la barra superior (solo para la vista antigua)
    const topBarStyle = {
        backgroundColor: '#27ae60',
        color: 'white',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        flexWrap: 'wrap',
        fontSize: '14px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    // Estilo para el botón de logout (solo para la vista antigua)
    const logoutButtonStyle = {
        padding: '8px 15px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.3s',
        fontWeight: 'bold'
    };

    // Renderizar según el rol del usuario
    const renderContent = () => {
        switch(user?.rol) {
            case 'admin':
                // Para admin, mostramos el nuevo Dashboard
                return <AdminDashboard user={user} onLogout={handleLogout} />;
            
            case 'directivo':
                // return <DirectivoDashboard user={user} onLogout={handleLogout} />;
                return (
                    <div>
                        {/* Barra superior con valores institucionales */}
                        <div style={topBarStyle}>
                            <span>RESPONSABILIDAD</span>
                            <span>SOLIDARIDAD</span>
                            <span>HONESTIDAD</span>
                            <span>RESPETO</span>
                            <span>TOLERANCIA</span>
                        </div>

                        {/* Contenido principal temporal para directivo */}
                        <div style={{ padding: '20px' }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '20px',
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                borderLeft: '4px solid #27ae60'
                            }}>
                                <h1 style={{ margin: 0, color: '#2c3e50' }}>
                                    🏫 Orizon Cottage - Panel Directivo
                                </h1>
                                <div>
                                    <span style={{ marginRight: '20px', fontWeight: 'bold', color: '#27ae60' }}>
                                        👤 {user?.nombre} ({user?.rol})
                                    </span>
                                    <button 
                                        onClick={handleLogout} 
                                        style={logoutButtonStyle}
                                        className="logout-btn"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '50px' }}>
                                <h2>🚧 Dashboard Directivo en construcción</h2>
                                <p>Próximamente: Panel de control para directivos con reportes de convivencia, seguimiento de observaciones y gestión institucional.</p>
                            </div>
                        </div>
                    </div>
                );
            
            case 'docente':
                // return <DocenteDashboard user={user} onLogout={handleLogout} />;
                return (
                    <div>
                        {/* Barra superior con valores institucionales */}
                        <div style={topBarStyle}>
                            <span>RESPONSABILIDAD</span>
                            <span>SOLIDARIDAD</span>
                            <span>HONESTIDAD</span>
                            <span>RESPETO</span>
                            <span>TOLERANCIA</span>
                        </div>

                        {/* Contenido principal temporal para docente */}
                        <div style={{ padding: '20px' }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '20px',
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                borderLeft: '4px solid #27ae60'
                            }}>
                                <h1 style={{ margin: 0, color: '#2c3e50' }}>
                                    🏫 Orizon Cottage - Panel Docente
                                </h1>
                                <div>
                                    <span style={{ marginRight: '20px', fontWeight: 'bold', color: '#27ae60' }}>
                                        👤 {user?.nombre} ({user?.rol})
                                    </span>
                                    <button 
                                        onClick={handleLogout} 
                                        style={logoutButtonStyle}
                                        className="logout-btn"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '50px' }}>
                                <h2>🚧 Dashboard Docente en construcción</h2>
                                <p>Próximamente: Panel de control para docentes con registro de asistencia, observador digital y comunicación con acudientes.</p>
                            </div>

                            {/* Vista previa de la tabla de estudiantes (temporal) */}
                            <h2 style={{ color: '#27ae60', borderBottom: '2px solid #27ae60', paddingBottom: '5px', marginTop: '40px' }}>
                                📊 Listado de Estudiantes ({students.length})
                            </h2>
                            
                            {/* Botones de control */}
                            <div style={{ marginBottom: '20px' }}>
                                <button 
                                    onClick={testConnection}
                                    style={buttonStyle}
                                    className="filter-btn"
                                >
                                    🔌 Probar Conexión
                                </button>
                                
                                <button 
                                    onClick={() => getStudentsByGrade('todos')}
                                    style={buttonStyle}
                                    className="filter-btn"
                                >
                                    📋 Todos los Estudiantes
                                </button>

                                <button 
                                    onClick={() => getStudentsByGrade('preescolar')}
                                    style={buttonStyle}
                                    className="filter-btn"
                                >
                                    🏫 Preescolar
                                </button>

                                <button 
                                    onClick={() => getStudentsByGrade('primaria')}
                                    style={buttonStyle}
                                    className="filter-btn"
                                >
                                    📚 Primaria
                                </button>

                                <button 
                                    onClick={() => getStudentsByGrade('secundaria')}
                                    style={buttonStyle}
                                    className="filter-btn"
                                >
                                    🎓 Secundaria
                                </button>
                            </div>

                            {/* Mensajes de estado */}
                            {message && (
                                <div style={{ 
                                    padding: '10px', 
                                    backgroundColor: '#d4edda',
                                    color: '#155724',
                                    border: '1px solid #c3e6cb',
                                    borderRadius: '5px',
                                    marginBottom: '10px'
                                }}>
                                    {message}
                                </div>
                            )}

                            {error && (
                                <div style={{ 
                                    padding: '10px', 
                                    backgroundColor: '#f8d7da',
                                    color: '#721c24',
                                    border: '1px solid #f5c6cb',
                                    borderRadius: '5px',
                                    marginBottom: '10px'
                                }}>
                                    {error}
                                </div>
                            )}
                            
                            {loading ? (
                                <p>Cargando datos...</p>
                            ) : (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>No.</th>
                                                <th>Nombre Completo</th>
                                                <th>Grado</th>
                                                <th>ID Estudiante</th>
                                                <th>Acudiente</th>
                                                <th>Teléfono</th>
                                                <th>Vereda</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.length > 0 ? (
                                                students.map((student, index) => (
                                                    <tr key={student._id || index}>
                                                        <td>{student.No || index + 1}</td>
                                                        <td><strong>{student.apellido || 'N/A'}</strong></td>
                                                        <td>
                                                            <span className={`grade-badge grade-${student.grado || 'preescolar'}`}>
                                                                {student.grado || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td>{student.id_estudiante || 'N/A'}</td>
                                                        <td>{student.nombre_acudiente || 'N/A'}</td>
                                                        <td>{student.telefono || 'N/A'}</td>
                                                        <td>{student.vereda || 'N/A'}</td>
                                                        <td>
                                                            <button style={actionButtonStyle} className="action-btn">👁️</button>
                                                            <button style={actionButtonStyle} className="action-btn">✏️</button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                                                        {error ? 'Error al cargar datos' : 'No hay estudiantes para mostrar'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                );
            
            case 'acudiente':
                // return <AcudienteDashboard user={user} onLogout={handleLogout} />;
                return (
                    <div>
                        {/* Barra superior con valores institucionales */}
                        <div style={topBarStyle}>
                            <span>RESPONSABILIDAD</span>
                            <span>SOLIDARIDAD</span>
                            <span>HONESTIDAD</span>
                            <span>RESPETO</span>
                            <span>TOLERANCIA</span>
                        </div>

                        {/* Contenido principal temporal para acudiente */}
                        <div style={{ padding: '20px' }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '20px',
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                borderLeft: '4px solid #27ae60'
                            }}>
                                <h1 style={{ margin: 0, color: '#2c3e50' }}>
                                    🏫 Orizon Cottage - Panel Acudiente
                                </h1>
                                <div>
                                    <span style={{ marginRight: '20px', fontWeight: 'bold', color: '#27ae60' }}>
                                        👤 {user?.nombre} ({user?.rol})
                                    </span>
                                    <button 
                                        onClick={handleLogout} 
                                        style={logoutButtonStyle}
                                        className="logout-btn"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '50px' }}>
                                <h2>🚧 Dashboard Acudiente en construcción</h2>
                                <p>Próximamente: Panel de control para acudientes con seguimiento de asistencia, observaciones y comunicación con docentes.</p>
                            </div>
                        </div>
                    </div>
                );
            
            default:
                return (
                    <div>
                        <div style={topBarStyle}>
                            <span>RESPONSABILIDAD</span>
                            <span>SOLIDARIDAD</span>
                            <span>HONESTIDAD</span>
                            <span>RESPETO</span>
                            <span>TOLERANCIA</span>
                        </div>
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <h2>❌ Rol no reconocido</h2>
                            <p>Por favor contacte al administrador</p>
                            <button onClick={handleLogout} style={logoutButtonStyle}>
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return renderContent();
}

// Estilos reutilizables
const buttonStyle = {
    margin: '0 5px 10px 5px',
    padding: '10px 18px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#e7e7e7',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s'
};

const actionButtonStyle = {
    margin: '0 5px',
    padding: '6px 12px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#e7e7e7',
    fontSize: '13px',
    transition: 'all 0.3s'
};

export default App;
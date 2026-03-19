// Frontend/src/App.jsx
import { useState, useEffect } from 'react';
import Login from './Pages/Login';
import AdminDashboard from './Pages/AdminDashboard';

// Docente
import DocenteLayout from './Pages/DocenteLayout';
import DocenteDashboard from './Pages/DocenteDashboard';
import DocenteInasistencias from './Pages/DocenteInasistencias';
import DocenteObservaciones from './Pages/DocenteObservaciones';
import DocenteHistorial from './Pages/DocenteHistorial';
import DocenteMensajeria from './Pages/DocenteMensajeria';

// Directivo
import DirectivoLayout from './Pages/DirectivoLayout';
import DirectivoDashboard from './Pages/DirectivoDashboard';
import DirectivoSeguimiento from './Pages/DirectivoSeguimiento';
import DirectivoReportes from './Pages/DirectivoReportes';
import DirectivoUsuarios from './Pages/DirectivoUsuarios';
import DirectivoMensajeria from './Pages/DirectivoMensajeria';

// Acudiente
import AcudienteLayout from './Pages/AcudienteLayout';
import AcudienteDashboard from './Pages/AcudienteDashboard';
import AcudienteAsistencia from './Pages/AcudienteAsistencia';
import AcudienteObservaciones from './Pages/AcudienteObservaciones';
import AcudienteMensajeria from './Pages/AcudienteMensajeria';

function App() {
    const [apiUrl] = useState('http://localhost:5000/api');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    // Estados para navegación por roles
    const [activeDocenteSection, setActiveDocenteSection] = useState('dashboard');
    const [activeDirectivoSection, setActiveDirectivoSection] = useState('dashboard');
    const [activeAcudienteSection, setActiveAcudienteSection] = useState('dashboard');

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

            /* Responsive table */
            @media (max-width: 768px) {
                table {
                    font-size: 12px;
                }
                th, td {
                    padding: 8px;
                }
            }
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

    // Cargar estudiantes cuando se autentique (solo para admin)
    useEffect(() => {
        if (isAuthenticated && user?.rol === 'admin') {
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
        setActiveDocenteSection('dashboard');
        setActiveDirectivoSection('dashboard');
        setActiveAcudienteSection('dashboard');
    };

    // Si no está autenticado, mostrar login
    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    // Estilo para la barra superior (solo para roles no-docente)
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

    // Estilo para el botón de logout (para roles no-docente)
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

    // Función para renderizar el contenido del docente
    const renderDocenteContent = () => {
        let content;
        switch(activeDocenteSection) {
            case 'dashboard':
                content = <DocenteDashboard user={user} />;
                break;
            case 'inasistencias':
                content = <DocenteInasistencias user={user} />;
                break;
            case 'observaciones':
                content = <DocenteObservaciones user={user} />;
                break;
            case 'historial':
                content = <DocenteHistorial user={user} />;
                break;
            case 'mensajeria':
                content = <DocenteMensajeria user={user} />;
                break;
            default:
                content = <DocenteDashboard user={user} />;
        }

        return (
            <DocenteLayout 
                user={user} 
                onLogout={handleLogout}
                activeSection={activeDocenteSection}
                setActiveSection={setActiveDocenteSection}
            >
                {content}
            </DocenteLayout>
        );
    };

    // Función para renderizar el contenido del directivo
    const renderDirectivoContent = () => {
        let content;
        switch(activeDirectivoSection) {
            case 'dashboard':
                content = <DirectivoDashboard user={user} />;
                break;
            case 'seguimiento':
                content = <DirectivoSeguimiento user={user} />;
                break;
            case 'reportes':
                content = <DirectivoReportes user={user} />;
                break;
            case 'usuarios':
                content = <DirectivoUsuarios user={user} />;
                break;
            case 'mensajeria':
                content = <DirectivoMensajeria user={user} />;
                break;
            default:
                content = <DirectivoDashboard user={user} />;
        }

        return (
            <DirectivoLayout 
                user={user} 
                onLogout={handleLogout}
                activeSection={activeDirectivoSection}
                setActiveSection={setActiveDirectivoSection}
            >
                {content}
            </DirectivoLayout>
        );
    };

    // Función para renderizar el contenido del acudiente
    const renderAcudienteContent = () => {
        let content;
        switch(activeAcudienteSection) {
            case 'dashboard':
                content = <AcudienteDashboard user={user} setActiveSection={setActiveAcudienteSection} />;
                break;
            case 'asistencia':
                content = <AcudienteAsistencia user={user} />;
                break;
            case 'observaciones':
                content = <AcudienteObservaciones user={user} />;
                break;
            case 'mensajeria':
                content = <AcudienteMensajeria user={user} />;
                break;
            default:
                content = <AcudienteDashboard user={user} setActiveSection={setActiveAcudienteSection} />;
        }

        return (
            <AcudienteLayout 
                user={user} 
                onLogout={handleLogout}
                activeSection={activeAcudienteSection}
                setActiveSection={setActiveAcudienteSection}
            >
                {content}
            </AcudienteLayout>
        );
    };

    // Renderizar según el rol del usuario
    const renderContent = () => {
        switch(user?.rol) {
            case 'admin':
                return <AdminDashboard user={user} onLogout={handleLogout} />;
            
            case 'directivo':
                return renderDirectivoContent();
            
            case 'docente':
                return renderDocenteContent();
            
            case 'acudiente':
                return renderAcudienteContent();
            
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
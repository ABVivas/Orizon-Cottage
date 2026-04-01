// Frontend/src/Pages/Login.jsx
import { useState, useEffect } from 'react';

const Login = ({ onLogin }) => {
    const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('admin');
    const [serverStatus, setServerStatus] = useState('checking');

    useEffect(() => {
        checkServerConnection();
    }, []);

    const checkServerConnection = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/test');
            if (response.ok) {
                setServerStatus('online');
                setError('');
            } else {
                setServerStatus('offline');
                setError('Servidor no responde correctamente');
            }
        } catch (err) {
            setServerStatus('offline');
            setError('No se puede conectar con el servidor. Verifique que el backend esté corriendo.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ numeroIdentificacion, password })
            });

            const data = await response.json();

            if (data.success) {
                if (data.user.rol !== selectedRole) {
                    setError(`El usuario no tiene el rol de ${selectedRole}. Rol actual: ${data.user.rol}`);
                    setLoading(false);
                    return;
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLogin(data.user);
            } else {
                setError(data.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginCard}>
                <div style={styles.header}>
                    <div style={styles.logoContainer}>
                        <img src="/images/logo-orizon.jpeg" alt="Orizon Cottage" style={styles.logo} />
                    </div>
                    <div style={styles.titleWrapper}>
                        <h1 style={styles.logoTitle}>ORIZON COTTAGE</h1>
                        <h2 style={styles.subLogo}>GESTIÓN ACADÉMICA</h2>
                        <p style={styles.location}>TIMBÍO CAUCA</p>
                    </div>
                    <div style={styles.schoolLogoContainer}>
                        <img src="/images/logo-cabana.png" alt="I.E. La Cabaña" style={styles.schoolLogo} />
                    </div>
                </div>

                <div style={styles.decorativeBar}></div>
                <h2 style={styles.systemTitle}>Sistema de Gestión de Convivencia</h2>
                <p style={styles.subtitle}>Ingrese sus credenciales para acceder al sistema</p>

                {serverStatus === 'offline' && (
                    <div style={styles.serverWarning}>
                        ⚠️ El servidor backend no está disponible. Asegúrese de ejecutar 'npm run dev' en la carpeta Backend.
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Tipo de Usuario</label>
                        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={styles.select}>
                            <option value="admin">Administrador</option>
                            <option value="directivo">Directivo</option>
                            <option value="docente">Docente</option>
                            <option value="acudiente">Acudiente</option>
                        </select>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Usuario</label>
                        <input
                            type="text"
                            value={numeroIdentificacion}
                            onChange={(e) => setNumeroIdentificacion(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Ingrese su usuario"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <div style={styles.passwordContainer}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={styles.passwordInput}
                                placeholder="Ingrese su contraseña"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={styles.error}>
                            {error}
                            {serverStatus === 'offline' && (
                                <button onClick={checkServerConnection} style={styles.retryButton}>
                                    Reintentar conexión
                                </button>
                            )}
                        </div>
                    )}

                    <button type="submit" style={styles.button} disabled={loading || serverStatus === 'offline'}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div style={styles.forgotPassword}>
                    <p style={styles.forgotText}>¿Olvidó su contraseña? Contacte al administrador</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
    },
    loginCard: {
        maxWidth: '500px',
        width: '100%',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        gap: '15px'
    },
    logoContainer: {
        width: '80px',
        height: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo: {
        maxWidth: '80px',
        maxHeight: '80px',
        objectFit: 'contain'
    },
    titleWrapper: {
        flex: 1,
        textAlign: 'center'
    },
    logoTitle: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '0 0 3px 0',
        letterSpacing: '1px'
    },
    subLogo: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#27ae60',
        margin: '0 0 3px 0',
        letterSpacing: '1px'
    },
    location: {
        fontSize: '12px',
        color: '#7f8c8d',
        margin: '0'
    },
    schoolLogoContainer: {
        width: '60px',
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    schoolLogo: {
        maxWidth: '60px',
        maxHeight: '60px',
        objectFit: 'contain'
    },
    decorativeBar: {
        width: '60px',
        height: '3px',
        backgroundColor: '#27ae60',
        margin: '15px auto 20px auto',
        borderRadius: '2px'
    },
    systemTitle: {
        fontSize: '18px',
        color: '#2c3e50',
        marginBottom: '5px',
        fontWeight: '500'
    },
    subtitle: {
        fontSize: '14px',
        color: '#7f8c8d',
        marginBottom: '25px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left'
    },
    inputGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#34495e',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    select: {
        width: '100%',
        padding: '12px',
        border: '1px solid #bdc3c7',
        borderRadius: '8px',
        fontSize: '15px',
        backgroundColor: 'white',
        cursor: 'pointer'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #bdc3c7',
        borderRadius: '8px',
        fontSize: '15px',
        boxSizing: 'border-box'
    },
    passwordContainer: {
        position: 'relative',
        width: '100%'
    },
    passwordInput: {
        width: '100%',
        padding: '12px',
        paddingRight: '45px',
        border: '1px solid #bdc3c7',
        borderRadius: '8px',
        fontSize: '15px',
        boxSizing: 'border-box'
    },
    eyeButton: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        padding: '0'
    },
    button: {
        backgroundColor: '#27ae60',
        color: 'white',
        padding: '14px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px'
    },
    error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '15px',
        textAlign: 'center',
        fontSize: '14px'
    },
    serverWarning: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '15px',
        fontSize: '13px',
        textAlign: 'center'
    },
    retryButton: {
        backgroundColor: 'transparent',
        border: '1px solid #721c24',
        color: '#721c24',
        padding: '5px 10px',
        borderRadius: '5px',
        marginTop: '10px',
        cursor: 'pointer',
        fontSize: '12px',
        display: 'block',
        margin: '10px auto 0'
    },
    forgotPassword: {
        marginTop: '20px',
        textAlign: 'center'
    },
    forgotText: {
        color: '#7f8c8d',
        fontSize: '13px',
        fontStyle: 'italic'
    }
};

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        input:focus, select:focus {
            border-color: #27ae60 !important;
            box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.2) !important;
            outline: none !important;
        }
        button:hover:not(:disabled) {
            background-color: #219a52 !important;
        }
    `;
    document.head.appendChild(style);
}

export default Login;
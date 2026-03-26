// Frontend/src/Pages/DocenteLayout.jsx
import { useState, useEffect } from "react";

const DocenteLayout = ({ user, onLogout, activeSection, setActiveSection, children }) => {

    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);

            if (!mobile) {
                setMenuOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Cargar configuración y filtrar menú
    useEffect(() => {
        const loadSettings = () => {
            const savedSettings = localStorage.getItem('adminSettings');
            let settings = { enableAttendance: true, enableObservations: true, enableMessaging: true };
            
            if (savedSettings) {
                try {
                    settings = JSON.parse(savedSettings);
                } catch (e) {
                    console.error('Error parsing settings:', e);
                }
            }
            
            const allItems = [
                { id: "dashboard", label: "Dashboard", icon: "📊" },
                { id: "inasistencias", label: "Registro de Inasistencias", icon: "📋" },
                { id: "observaciones", label: "Registro de Observaciones", icon: "📝" },
                { id: "historial", label: "Historial", icon: "📚" },
                { id: "mensajeria", label: "Mensajería", icon: "💬" }
            ];
            
            // Filtrar según configuración
            const filtered = allItems.filter(item => {
                if (item.id === "inasistencias") return settings.enableAttendance;
                if (item.id === "observaciones") return settings.enableObservations;
                if (item.id === "mensajeria") return settings.enableMessaging;
                return true; // dashboard e historial siempre visibles
            });
            
            setMenuItems(filtered);
        };
        
        loadSettings();
        
        // Escuchar cambios en localStorage
        const handleStorageChange = () => {
            loadSettings();
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <div style={styles.container}>

            {/* TOP BAR */}
            <div style={styles.topBar}>

                <div style={styles.leftTopBar}>

                    {isMobile && (
                        <button
                            style={styles.menuButton}
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            ☰
                        </button>
                    )}

                    {/* Logo Orizon Cottage */}
                    <div style={styles.logoContainer}>
                        <img 
                            src="/images/logo-orizon.jpeg" 
                            alt="Orizon Cottage" 
                            style={styles.logo}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                const fallback = document.createElement('span');
                                fallback.innerHTML = '🏫';
                                fallback.style.fontSize = '28px';
                                e.target.parentElement.appendChild(fallback);
                            }}
                        />
                    </div>

                    <div>
                        <h1 style={styles.title}>Orizon Cottage</h1>
                        <p style={styles.subtitle}>Gestión de Convivencia</p>
                    </div>

                </div>

                <div style={styles.userArea}>

                    {/* Logo Institución Educativa La Cabaña */}
                    <div style={styles.schoolLogoContainer}>
                        <img 
                            src="/images/logo-cabana.png" 
                            alt="I.E. La Cabaña" 
                            style={styles.schoolLogo}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                const fallback = document.createElement('span');
                                fallback.innerHTML = '📚';
                                fallback.style.fontSize = '24px';
                                e.target.parentElement.appendChild(fallback);
                            }}
                        />
                    </div>

                    <span style={styles.userName}>👤 {user?.nombre?.split(' ')[0] || 'Docente'}</span>
                    <span style={styles.userRole}>{user?.rol}</span>

                    <button
                        style={styles.logoutButton}
                        onClick={onLogout}
                    >
                        Cerrar Sesión
                    </button>
                </div>

            </div>

            {/* MAIN AREA */}
            <div style={styles.mainContainer}>

                {/* SIDEBAR */}
                <div
                    style={{
                        ...styles.sidebar,
                        ...(isMobile && {
                            position: "fixed",
                            left: 0,
                            top: 70,
                            transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
                            width: "80%",
                            maxWidth: "300px",
                            zIndex: 100
                        })
                    }}
                >

                    <h3 style={styles.sidebarTitle}>Panel Principal</h3>

                    <ul style={styles.menuList}>
                        {menuItems.map((item) => (
                            <li
                                key={item.id}
                                style={{
                                    ...styles.menuItem,
                                    ...(activeSection === item.id && styles.menuItemActive)
                                }}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    if (isMobile) setMenuOpen(false);
                                }}
                            >
                                <span style={styles.menuIcon}>{item.icon}</span>
                                {item.label}
                            </li>
                        ))}
                    </ul>

                </div>

                {/* OVERLAY MOBILE */}
                {isMobile && menuOpen && (
                    <div
                        style={styles.overlay}
                        onClick={() => setMenuOpen(false)}
                    />
                )}

                {/* CONTENT */}
                <div style={styles.content}>
                    {children}
                </div>

            </div>

        </div>
    );
};

const styles = {

    container: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5"
    },

    topBar: {
        height: "70px",
        backgroundColor: "#27ae60",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        position: "sticky",
        top: 0,
        zIndex: 200
    },

    leftTopBar: {
        display: "flex",
        alignItems: "center",
        gap: "15px"
    },

    menuButton: {
        fontSize: "24px",
        border: "none",
        background: "transparent",
        color: "white",
        cursor: "pointer"
    },

    logoContainer: {
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },

    logo: {
        maxWidth: "40px",
        maxHeight: "40px",
        objectFit: "contain"
    },

    title: {
        margin: 0,
        fontSize: "18px"
    },

    subtitle: {
        margin: 0,
        fontSize: "10px",
        opacity: 0.9
    },

    userArea: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },

    schoolLogoContainer: {
        width: "35px",
        height: "35px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },

    schoolLogo: {
        maxWidth: "35px",
        maxHeight: "35px",
        objectFit: "contain"
    },

    userName: {
        fontWeight: "bold",
        fontSize: "14px"
    },

    userRole: {
        fontSize: "12px",
        background: "rgba(255,255,255,0.2)",
        padding: "4px 10px",
        borderRadius: "15px"
    },

    logoutButton: {
        background: "#e74c3c",
        color: "white",
        border: "none",
        padding: "8px 14px",
        borderRadius: "6px",
        cursor: "pointer"
    },

    mainContainer: {
        flex: 1,
        display: "flex",
        position: "relative"
    },

    sidebar: {
        width: "260px",
        backgroundColor: "white",
        borderRight: "1px solid #eee",
        paddingTop: "20px",
        transition: "transform 0.3s",
        zIndex: 50
    },

    sidebarTitle: {
        padding: "0 20px",
        fontSize: "13px",
        textTransform: "uppercase",
        color: "#7f8c8d",
        marginBottom: "15px"
    },

    menuList: {
        listStyle: "none",
        padding: 0,
        margin: 0
    },

    menuItem: {
        padding: "12px 20px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: "#555",
        borderLeft: "3px solid transparent"
    },

    menuItemActive: {
        backgroundColor: "#e8f5e9",
        color: "#27ae60",
        fontWeight: "bold",
        borderLeft: "3px solid #27ae60"
    },

    menuIcon: {
        fontSize: "18px"
    },

    content: {
        flex: 1,
        padding: "20px",
        overflowY: "auto",
        minWidth: 0
    },

    overlay: {
        position: "fixed",
        top: 70,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 90
    }

};

export default DocenteLayout;
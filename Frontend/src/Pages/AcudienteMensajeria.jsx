// Frontend/src/Pages/AcudienteMensajeria.jsx
import { useState, useEffect } from 'react';

const AcudienteMensajeria = ({ user }) => {
    const [activeTab, setActiveTab] = useState('recibidos');
    const [mensajes, setMensajes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMensajes();
    }, [activeTab]);

    const fetchMensajes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'recibidos' 
                ? `http://localhost:5000/api/messages/recibidos/${user.id}`
                : `http://localhost:5000/api/messages/enviados/${user.id}`;
            
            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMensajes(data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) return `Hace ${diffMins} minutos`;
        if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} horas`;
        return `Hace ${Math.floor(diffMins / 1440)} días`;
    };

    if (loading) return <div style={styles.loading}>Cargando...</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Mensajería Interna</h2>
            <p style={styles.pageSubtitle}>Comuníquese con docentes y directivos</p>

            {/* Tabs */}
            <div style={styles.tabsContainer}>
                <button 
                    style={{...styles.tab, ...(activeTab === 'recibidos' && styles.activeTab)}}
                    onClick={() => setActiveTab('recibidos')}
                >
                    Recibidos
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'enviados' && styles.activeTab)}}
                    onClick={() => setActiveTab('enviados')}
                >
                    Enviados
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'nuevo' && styles.activeTab)}}
                    onClick={() => setActiveTab('nuevo')}
                >
                    Nuevo Mensaje
                </button>
            </div>

            {/* Contenido según tab */}
            <div style={styles.contentCard}>
                {activeTab === 'recibidos' && (
                    <div style={styles.mensajesList}>
                        {mensajes.length === 0 ? (
                            <div style={styles.emptyState}>
                                <p>No hay mensajes recibidos</p>
                            </div>
                        ) : (
                            mensajes.map((msg, index) => (
                                <div key={index} style={styles.mensajeItem}>
                                    <div style={styles.mensajeHeader}>
                                        <span style={styles.mensajeRemitente}>{msg.remitente}</span>
                                        <span style={styles.mensajeHora}>{formatTimeAgo(msg.fecha)}</span>
                                    </div>
                                    <p style={styles.mensajePreview}>{msg.contenido}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'enviados' && (
                    <div style={styles.mensajesList}>
                        {mensajes.length === 0 ? (
                            <div style={styles.emptyState}>
                                <p>No hay mensajes enviados</p>
                            </div>
                        ) : (
                            mensajes.map((msg, index) => (
                                <div key={index} style={styles.mensajeItem}>
                                    <div style={styles.mensajeHeader}>
                                        <span style={styles.mensajeRemitente}>Para: {msg.destinatario}</span>
                                        <span style={styles.mensajeHora}>{formatTimeAgo(msg.fecha)}</span>
                                    </div>
                                    <p style={styles.mensajePreview}>{msg.contenido}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'nuevo' && (
                    <div style={styles.formContainer}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Para:</label>
                            <select style={styles.select}>
                                <option>Seleccione un destinatario</option>
                                <option>Profesora María García</option>
                                <option>Profesor Carlos López</option>
                                <option>Coordinador Académico</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Asunto:</label>
                            <input type="text" style={styles.input} placeholder="Asunto del mensaje" />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mensaje:</label>
                            <textarea style={styles.textarea} rows="5" placeholder="Escriba su mensaje aquí..."></textarea>
                        </div>

                        <button style={styles.sendButton}>Enviar Mensaje</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
    loading: { textAlign: 'center', padding: '50px' },
    pageTitle: { margin: '0 0 5px 0', fontSize: '24px', color: '#2c3e50' },
    pageSubtitle: { margin: '0 0 25px 0', fontSize: '14px', color: '#7f8c8d' },
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
    contentCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '20px',
        minHeight: '300px'
    },
    mensajesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    mensajeItem: {
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        ':hover': {
            backgroundColor: '#e8f5e9'
        }
    },
    mensajeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    mensajeRemitente: {
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    mensajeHora: {
        fontSize: '12px',
        color: '#7f8c8d'
    },
    mensajePreview: {
        margin: 0,
        color: '#2c3e50',
        fontSize: '14px'
    },
    emptyState: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '250px',
        color: '#95a5a6',
        fontSize: '16px'
    },
    formContainer: {
        maxWidth: '600px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    select: {
        width: '100%',
        padding: '12px',
        border: '1px solid #bdc3c7',
        borderRadius: '6px',
        fontSize: '14px'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #bdc3c7',
        borderRadius: '6px',
        fontSize: '14px'
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #bdc3c7',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical'
    },
    sendButton: {
        padding: '12px 24px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '15px',
        ':hover': {
            backgroundColor: '#219a52'
        }
    }
};

export default AcudienteMensajeria;
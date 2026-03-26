// Frontend/src/Pages/AcudienteMensajeria.jsx
import { useState, useEffect } from 'react';

const AcudienteMensajeria = ({ user }) => {
    const [activeTab, setActiveTab] = useState('recibidos');
    const [mensajes, setMensajes] = useState([]);
    const [destinatarios, setDestinatarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const [nuevoMensaje, setNuevoMensaje] = useState({
        destinatarioId: '',
        asunto: '',
        contenido: ''
    });

    useEffect(() => {
        if (activeTab === 'recibidos' || activeTab === 'enviados') {
            fetchMensajes();
        }
        if (activeTab === 'nuevo') {
            fetchDestinatarios();
        }
    }, [activeTab]);

    const fetchMensajes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setErrorMsg('No hay sesión activa');
                setLoading(false);
                return;
            }

            const endpoint = activeTab === 'recibidos' 
                ? `http://localhost:5000/api/messages/received/${user.id}`
                : `http://localhost:5000/api/messages/sent/${user.id}`;
            
            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setMensajes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error:', error);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ CORREGIDO: Usar el endpoint /api/users/destinatarios
    const fetchDestinatarios = async () => {
        try {
            setLoading(true);
            setErrorMsg('');
            const token = localStorage.getItem('token');
            
            if (!token) {
                setErrorMsg('No hay sesión activa. Por favor inicie sesión nuevamente.');
                setLoading(false);
                return;
            }

            console.log('🔍 Buscando destinatarios...');
            
            const response = await fetch('http://localhost:5000/api/users/destinatarios', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('👥 Destinatarios recibidos:', data);
            
            setDestinatarios(data.users || []);
            
            if (data.users?.length === 0) {
                setErrorMsg('No hay docentes o directivos disponibles para contactar.');
            }
            
        } catch (error) {
            console.error('❌ Error fetching destinatarios:', error);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarMensaje = async (e) => {
        e.preventDefault();
        
        if (!nuevoMensaje.destinatarioId || !nuevoMensaje.asunto || !nuevoMensaje.contenido) {
            alert('Por favor complete todos los campos');
            return;
        }

        setEnviando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    remitenteId: user.id,
                    destinatarioId: nuevoMensaje.destinatarioId,
                    asunto: nuevoMensaje.asunto,
                    contenido: nuevoMensaje.contenido
                })
            });

            if (response.ok) {
                alert('✅ Mensaje enviado exitosamente');
                setNuevoMensaje({ destinatarioId: '', asunto: '', contenido: '' });
                setActiveTab('enviados');
            } else {
                const error = await response.json();
                alert(`❌ Error: ${error.message || 'No se pudo enviar el mensaje'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión con el servidor');
        } finally {
            setEnviando(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const marcarComoLeido = async (messageId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/messages/read/${messageId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchMensajes();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (loading && activeTab !== 'nuevo') {
        return <div style={styles.loading}>Cargando mensajes...</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Mensajería Interna</h2>
            <p style={styles.pageSubtitle}>Comuníquese con docentes y directivos</p>

            {errorMsg && (
                <div style={styles.errorMsg}>
                    ⚠️ {errorMsg}
                    {activeTab === 'nuevo' && (
                        <button onClick={fetchDestinatarios} style={styles.retryBtn}>Reintentar</button>
                    )}
                </div>
            )}

            <div style={styles.tabsContainer}>
                <button 
                    style={{...styles.tab, ...(activeTab === 'recibidos' && styles.activeTab)}}
                    onClick={() => setActiveTab('recibidos')}
                >
                    Recibidos ({mensajes.filter(m => !m.leido).length})
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

            <div style={styles.contentCard}>
                {activeTab === 'recibidos' && (
                    <div style={styles.mensajesList}>
                        {mensajes.length === 0 ? (
                            <div style={styles.emptyState}>
                                <p>📭 No hay mensajes recibidos</p>
                            </div>
                        ) : (
                            mensajes.map((msg) => (
                                <div 
                                    key={msg._id} 
                                    style={{
                                        ...styles.mensajeItem,
                                        backgroundColor: msg.leido ? '#f8f9fa' : '#fff3e0'
                                    }}
                                    onClick={() => !msg.leido && marcarComoLeido(msg._id)}
                                >
                                    <div style={styles.mensajeHeader}>
                                        <span style={styles.mensajeRemitente}>
                                            {msg.remitenteId?.nombre || 'Remitente'}
                                            {!msg.leido && <span style={styles.noLeidoBadge}>Nuevo</span>}
                                        </span>
                                        <span style={styles.mensajeHora}>{formatDate(msg.fechaEnvio || msg.createdAt)}</span>
                                    </div>
                                    <h4 style={styles.mensajeAsunto}>{msg.asunto}</h4>
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
                                <p>📤 No hay mensajes enviados</p>
                            </div>
                        ) : (
                            mensajes.map((msg) => (
                                <div key={msg._id} style={styles.mensajeItem}>
                                    <div style={styles.mensajeHeader}>
                                        <span style={styles.mensajeRemitente}>
                                            Para: {msg.destinatarioId?.nombre || 'Destinatario'}
                                        </span>
                                        <span style={styles.mensajeHora}>{formatDate(msg.fechaEnvio || msg.createdAt)}</span>
                                    </div>
                                    <h4 style={styles.mensajeAsunto}>{msg.asunto}</h4>
                                    <p style={styles.mensajePreview}>{msg.contenido}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'nuevo' && (
                    <form onSubmit={handleEnviarMensaje} style={styles.formContainer}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Para *</label>
                            <select 
                                style={styles.select}
                                value={nuevoMensaje.destinatarioId}
                                onChange={(e) => setNuevoMensaje({...nuevoMensaje, destinatarioId: e.target.value})}
                                required
                            >
                                <option value="">Seleccione un destinatario</option>
                                {destinatarios.map(d => (
                                    <option key={d._id} value={d._id}>
                                        {d.nombre} ({d.rol === 'docente' ? 'Docente' : 'Directivo'})
                                    </option>
                                ))}
                            </select>
                            {destinatarios.length === 0 && (
                                <p style={styles.helpText}>No hay destinatarios disponibles</p>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Asunto *</label>
                            <input 
                                type="text" 
                                style={styles.input} 
                                placeholder="Asunto del mensaje"
                                value={nuevoMensaje.asunto}
                                onChange={(e) => setNuevoMensaje({...nuevoMensaje, asunto: e.target.value})}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mensaje *</label>
                            <textarea 
                                style={styles.textarea} 
                                rows="6" 
                                placeholder="Escriba su mensaje aquí..."
                                value={nuevoMensaje.contenido}
                                onChange={(e) => setNuevoMensaje({...nuevoMensaje, contenido: e.target.value})}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            style={styles.sendButton}
                            disabled={enviando || destinatarios.length === 0}
                        >
                            {enviando ? 'Enviando...' : '📧 Enviar Mensaje'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
    loading: { textAlign: 'center', padding: '50px', color: '#7f8c8d' },
    pageTitle: { margin: '0 0 5px 0', fontSize: '28px', fontWeight: '600', color: '#2c3e50' },
    pageSubtitle: { margin: '0 0 24px 0', fontSize: '16px', color: '#7f8c8d' },
    
    errorMsg: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    retryBtn: {
        padding: '4px 12px',
        backgroundColor: '#c53030',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    
    tabsContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #ecf0f1',
        paddingBottom: '10px'
    },
    tab: {
        padding: '10px 24px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '15px',
        color: '#7f8c8d',
        borderRadius: '5px 5px 0 0',
        transition: 'all 0.2s'
    },
    activeTab: {
        color: '#27ae60',
        borderBottom: '2px solid #27ae60',
        fontWeight: 'bold'
    },
    contentCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        padding: '24px',
        minHeight: '400px'
    },
    mensajesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    mensajeItem: {
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: '1px solid #e2e8f0'
    },
    mensajeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        flexWrap: 'wrap',
        gap: '8px'
    },
    mensajeRemitente: {
        fontWeight: '600',
        color: '#2d3748',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    noLeidoBadge: {
        fontSize: '10px',
        backgroundColor: '#f39c12',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '20px'
    },
    mensajeAsunto: {
        margin: '8px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    mensajeHora: {
        fontSize: '12px',
        color: '#718096'
    },
    mensajePreview: {
        margin: 0,
        color: '#4a5568',
        fontSize: '14px',
        lineHeight: '1.5'
    },
    emptyState: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
        color: '#a0aec0',
        fontSize: '16px'
    },
    formContainer: {
        maxWidth: '100%'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#2c3e50',
        fontSize: '14px'
    },
    select: {
        width: '100%',
        padding: '12px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box'
    },
    helpText: {
        marginTop: '4px',
        fontSize: '12px',
        color: '#e74c3c'
    },
    sendButton: {
        padding: '12px 24px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.2s',
        ':hover': {
            backgroundColor: '#219a52'
        }
    }
};

export default AcudienteMensajeria;
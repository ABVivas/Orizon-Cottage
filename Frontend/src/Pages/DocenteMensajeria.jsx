// Frontend/src/Pages/DocenteMensajeria.jsx
import { useState, useEffect } from 'react';

const DocenteMensajeria = ({ user }) => {
    const [activeTab, setActiveTab] = useState('recibidos');
    const [mensajes, setMensajes] = useState([]);
    const [destinatarios, setDestinatarios] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState({
        destinatario: '',
        asunto: '',
        contenido: ''
    });

    useEffect(() => {
        fetchMensajes();
        fetchDestinatarios();
    }, [user, activeTab]);

    const fetchMensajes = async () => {
        try {
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
        }
    };

    const fetchDestinatarios = async () => {
        try {
            const token = localStorage.getItem('token');
            // Obtener acudientes y directivos
            const response = await fetch('http://localhost:5000/api/users?roles=acudiente,directivo', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setDestinatarios(data.users || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEnviarMensaje = async (e) => {
        e.preventDefault();
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
                    destinatarioId: nuevoMensaje.destinatario,
                    asunto: nuevoMensaje.asunto,
                    contenido: nuevoMensaje.contenido
                })
            });

            if (response.ok) {
                alert('Mensaje enviado');
                setNuevoMensaje({ destinatario: '', asunto: '', contenido: '' });
                setActiveTab('enviados');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Mensajería Interna</h2>
            <p style={styles.subtitle}>Comuníquese con acudientes y directivos</p>

            <div style={styles.tabContainer}>
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

            <div style={styles.content}>
                {activeTab === 'recibidos' && (
                    <div style={styles.messageList}>
                        {mensajes.length === 0 ? (
                            <p style={styles.emptyMessage}>No hay mensajes recibidos</p>
                        ) : (
                            mensajes.map(msg => (
                                <div key={msg._id} style={styles.messageCard}>
                                    <div style={styles.messageHeader}>
                                        <strong>{msg.remitente}</strong>
                                        <span style={styles.messageDate}>
                                            {new Date(msg.fecha).toLocaleString()}
                                        </span>
                                    </div>
                                    <h4 style={styles.messageSubject}>{msg.asunto}</h4>
                                    <p style={styles.messageContent}>{msg.contenido}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'enviados' && (
                    <div style={styles.messageList}>
                        {mensajes.length === 0 ? (
                            <p style={styles.emptyMessage}>No hay mensajes enviados</p>
                        ) : (
                            mensajes.map(msg => (
                                <div key={msg._id} style={styles.messageCard}>
                                    <div style={styles.messageHeader}>
                                        <strong>Para: {msg.destinatario}</strong>
                                        <span style={styles.messageDate}>
                                            {new Date(msg.fecha).toLocaleString()}
                                        </span>
                                    </div>
                                    <h4 style={styles.messageSubject}>{msg.asunto}</h4>
                                    <p style={styles.messageContent}>{msg.contenido}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'nuevo' && (
                    <div style={styles.newMessageForm}>
                        <form onSubmit={handleEnviarMensaje}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Destinatario</label>
                                <select
                                    style={styles.select}
                                    value={nuevoMensaje.destinatario}
                                    onChange={(e) => setNuevoMensaje({...nuevoMensaje, destinatario: e.target.value})}
                                    required
                                >
                                    <option value="">Seleccione destinatario</option>
                                    {destinatarios.map(d => (
                                        <option key={d._id} value={d._id}>
                                            {d.nombre} ({d.rol})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Asunto</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    value={nuevoMensaje.asunto}
                                    onChange={(e) => setNuevoMensaje({...nuevoMensaje, asunto: e.target.value})}
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Mensaje</label>
                                <textarea
                                    style={styles.textarea}
                                    rows="5"
                                    value={nuevoMensaje.contenido}
                                    onChange={(e) => setNuevoMensaje({...nuevoMensaje, contenido: e.target.value})}
                                    required
                                />
                            </div>

                            <button type="submit" style={styles.submitButton}>
                                Enviar Mensaje
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px'
    },
    title: {
        margin: '0 0 5px 0',
        color: '#2c3e50',
        fontSize: '22px'
    },
    subtitle: {
        margin: '0 0 30px 0',
        color: '#7f8c8d',
        fontSize: '14px'
    },
    tabContainer: {
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
    content: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '20px'
    },
    messageList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    messageCard: {
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px',
        borderLeft: '3px solid #27ae60'
    },
    messageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px'
    },
    messageDate: {
        color: '#7f8c8d',
        fontSize: '12px'
    },
    messageSubject: {
        margin: '10px 0',
        color: '#2c3e50'
    },
    messageContent: {
        margin: 0,
        color: '#2c3e50',
        lineHeight: '1.5'
    },
    newMessageForm: {
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
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical'
    },
    submitButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#95a5a6',
        padding: '40px'
    }
};

export default DocenteMensajeria;
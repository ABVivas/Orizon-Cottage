// Frontend/src/Pages/InstitutionalMessaging.jsx
import { useState, useEffect } from 'react';

const InstitutionalMessaging = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCompose, setShowCompose] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [formData, setFormData] = useState({
        to: '',
        subject: '',
        body: ''
    });

    useEffect(() => {
        fetchMessages();
        fetchUsers();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/messages', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSendMessage = async (e) => {
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
                    ...formData,
                    from: user?.id
                })
            });
            const data = await response.json();
            if (data.success) {
                setShowCompose(false);
                setFormData({ to: '', subject: '', body: '' });
                fetchMessages();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <div style={styles.header}>
                <h2 style={styles.title}>Mensajería Institucional</h2>
                <button 
                    style={styles.composeButton}
                    onClick={() => setShowCompose(true)}
                >
                    + Nuevo Mensaje
                </button>
            </div>

            {showCompose && (
                <div style={styles.composeModal}>
                    <h3 style={styles.modalTitle}>Nuevo Mensaje</h3>
                    <form onSubmit={handleSendMessage} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Para:</label>
                            <select
                                value={formData.to}
                                onChange={(e) => setFormData({...formData, to: e.target.value})}
                                required
                                style={styles.select}
                            >
                                <option value="">Seleccionar destinatario</option>
                                {users.map(u => (
                                    <option key={u._id} value={u._id}>
                                        {u.nombre} ({u.rol})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Asunto:</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mensaje:</label>
                            <textarea
                                value={formData.body}
                                onChange={(e) => setFormData({...formData, body: e.target.value})}
                                required
                                style={styles.textarea}
                                rows="5"
                            />
                        </div>
                        <div style={styles.modalButtons}>
                            <button 
                                type="button" 
                                style={styles.cancelButton}
                                onClick={() => setShowCompose(false)}
                            >
                                Cancelar
                            </button>
                            <button type="submit" style={styles.sendButton}>
                                Enviar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div style={styles.messageList}>
                    {messages.map((message) => (
                        <div 
                            key={message._id} 
                            style={styles.messageCard}
                            onClick={() => setSelectedMessage(message)}
                        >
                            <div style={styles.messageHeader}>
                                <strong>{message.subject}</strong>
                                <span style={styles.messageDate}>
                                    {new Date(message.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div style={styles.messagePreview}>
                                <span>De: {message.from?.nombre}</span>
                                <span> - </span>
                                <span>{message.body.substring(0, 100)}...</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    title: {
        margin: 0,
        color: '#2c3e50',
        fontSize: '22px'
    },
    composeButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    composeModal: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '10px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
        marginBottom: '30px'
    },
    modalTitle: {
        margin: '0 0 20px 0',
        color: '#2c3e50'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontWeight: 'bold',
        color: '#2c3e50',
        fontSize: '14px'
    },
    select: {
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px'
    },
    input: {
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px'
    },
    textarea: {
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        resize: 'vertical'
    },
    modalButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '10px'
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    sendButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    messageList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    messageCard: {
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s'
    },
    messageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    messageDate: {
        fontSize: '12px',
        color: '#7f8c8d'
    },
    messagePreview: {
        fontSize: '13px',
        color: '#34495e'
    }
};

export default InstitutionalMessaging;
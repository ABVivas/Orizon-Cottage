// Frontend/src/Pages/AdminMessaging.jsx
import { useState, useEffect } from 'react';

const AdminMessaging = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCompose, setShowCompose] = useState(false);
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({ destinatarioId: '', asunto: '', contenido: '' });

    useEffect(() => {
        fetchMessages();
        fetchUsers();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/messages/received/${user?.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setUsers((data.users || []).filter(u => u._id !== user?.id));
        } catch (error) { console.error('Error:', error); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!formData.destinatarioId || !formData.asunto || !formData.contenido) {
            alert('Por favor complete todos los campos');
            return;
        }
        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/messages', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ remitenteId: user?.id, destinatarioId: formData.destinatarioId, asunto: formData.asunto, contenido: formData.contenido })
            });
            const data = await response.json();
            if (response.ok) {
                alert('✅ Mensaje enviado exitosamente');
                setShowCompose(false);
                setFormData({ destinatarioId: '', asunto: '', contenido: '' });
                fetchMessages();
            } else { alert(`❌ Error: ${data.error || data.message || 'No se pudo enviar el mensaje'}`); }
        } catch (error) { console.error('Error:', error); alert('❌ Error de conexión con el servidor'); }
        finally { setSending(false); }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const marcarComoLeido = async (messageId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/messages/read/${messageId}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            fetchMessages();
        } catch (error) { console.error('Error:', error); }
    };

    return (
        <div>
            <div style={styles.header}><h2 style={styles.title}>Mensajería Institucional</h2><button style={styles.composeButton} onClick={() => setShowCompose(true)}>+ Nuevo Mensaje</button></div>
            {showCompose && <div style={styles.composeModal}><h3 style={styles.modalTitle}>Nuevo Mensaje</h3>
                <form onSubmit={handleSendMessage} style={styles.form}>
                    <div style={styles.formGroup}><label style={styles.label}>Para:</label><select value={formData.destinatarioId} onChange={(e) => setFormData({...formData, destinatarioId: e.target.value})} required style={styles.select}>
                        <option value="">Seleccionar destinatario</option>{users.map(u => <option key={u._id} value={u._id}>{u.nombre} ({u.rol === 'docente' ? 'Docente' : u.rol === 'acudiente' ? 'Acudiente' : 'Directivo'})</option>)}
                    </select></div>
                    <div style={styles.formGroup}><label style={styles.label}>Asunto:</label><input type="text" value={formData.asunto} onChange={(e) => setFormData({...formData, asunto: e.target.value})} required style={styles.input} /></div>
                    <div style={styles.formGroup}><label style={styles.label}>Mensaje:</label><textarea value={formData.contenido} onChange={(e) => setFormData({...formData, contenido: e.target.value})} required style={styles.textarea} rows="5" /></div>
                    <div style={styles.modalButtons}><button type="button" style={styles.cancelButton} onClick={() => setShowCompose(false)}>Cancelar</button><button type="submit" style={styles.sendButton} disabled={sending}>{sending ? 'Enviando...' : 'Enviar'}</button></div>
                </form>
            </div>}
            {loading ? <p>Cargando mensajes...</p> : <div style={styles.messageList}>
                {messages.length === 0 ? <div style={styles.emptyState}><p>📭 No hay mensajes recibidos</p></div> :
                    messages.map(msg => <div key={msg._id} style={{...styles.messageCard, backgroundColor: msg.leido ? '#f8f9fa' : '#fff3e0'}} onClick={() => !msg.leido && marcarComoLeido(msg._id)}>
                        <div style={styles.messageHeader}><strong>{msg.asunto}</strong><span style={styles.messageDate}>{formatDate(msg.fechaEnvio || msg.createdAt)}</span></div>
                        <div style={styles.messagePreview}><span>De: {msg.remitenteId?.nombre || 'Remitente'}</span>{!msg.leido && <span style={styles.newBadge}>Nuevo</span>}</div>
                        <p style={styles.messageContent}>{msg.contenido}</p>
                    </div>)}
            </div>}
        </div>
    );
};

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { margin: 0, color: '#2c3e50', fontSize: '24px', fontWeight: '600' },
    composeButton: { padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    composeModal: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.15)', marginBottom: '30px' },
    modalTitle: { margin: '0 0 20px 0', color: '#2c3e50', fontSize: '18px', fontWeight: '600' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontWeight: '600', color: '#2c3e50', fontSize: '14px' },
    select: { padding: '10px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px' },
    input: { padding: '10px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px' },
    textarea: { padding: '10px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' },
    modalButtons: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
    cancelButton: { padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    sendButton: { padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    messageList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    messageCard: { backgroundColor: 'white', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', borderLeft: '3px solid #27ae60' },
    messageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    messageDate: { fontSize: '12px', color: '#7f8c8d' },
    messagePreview: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#7f8c8d', marginBottom: '8px' },
    newBadge: { fontSize: '10px', backgroundColor: '#f39c12', color: 'white', padding: '2px 8px', borderRadius: '12px' },
    messageContent: { margin: 0, fontSize: '14px', color: '#2c3e50', lineHeight: '1.5' },
    emptyState: { textAlign: 'center', padding: '40px', color: '#95a5a6', backgroundColor: 'white', borderRadius: '10px' }
};

export default AdminMessaging;
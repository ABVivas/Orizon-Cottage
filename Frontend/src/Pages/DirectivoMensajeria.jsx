// Frontend/src/Pages/DirectivoMensajeria.jsx
// Frontend/src/Pages/DirectivoMensajeria.jsx
import { useState, useEffect } from 'react';

const DirectivoMensajeria = ({ user }) => {
    const [activeTab, setActiveTab] = useState('recibidos');
    const [mensajes, setMensajes] = useState([]);
    const [mensajesEnviados, setMensajesEnviados] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageEnviados, setCurrentPageEnviados] = useState(1);
    const itemsPerPage = 10;
    
    const [nuevoMensaje, setNuevoMensaje] = useState({
        destinatarioId: '',
        asunto: '',
        contenido: ''
    });
    
    const [mensajeMasivo, setMensajeMasivo] = useState({
        grupo: '',
        asunto: '',
        contenido: ''
    });
    
    const gruposMasivos = [
        { id: 'docentes', label: 'Todos los Docentes', rol: 'docente' },
        { id: 'acudientes', label: 'Todos los Acudientes', rol: 'acudiente' },
        { id: 'directivos', label: 'Todos los Directivos', rol: 'directivo' },
        { id: 'todos', label: 'Toda la Comunidad Educativa', rol: 'todos' }
    ];

    useEffect(() => {
        fetchDestinatarios();
        if (activeTab === 'recibidos') {
            fetchMensajesRecibidos();
        } else if (activeTab === 'enviados') {
            fetchMensajesEnviados();
        }
    }, [activeTab, user]);

    // Resetear página cuando cambia de tab
    useEffect(() => {
        if (activeTab === 'recibidos') {
            setCurrentPage(1);
        } else if (activeTab === 'enviados') {
            setCurrentPageEnviados(1);
        }
    }, [activeTab]);

    const fetchDestinatarios = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/destinatarios', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUsuarios(data.users || []);
            }
        } catch (error) {
            console.error('Error fetching destinatarios:', error);
        }
    };

    const fetchMensajesRecibidos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/messages/received/${user?.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMensajes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error:', error);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMensajesEnviados = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/messages/sent/${user?.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMensajesEnviados(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error:', error);
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
                fetchMensajesEnviados();
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

    const handleEnviarMensajeMasivo = async (e) => {
        e.preventDefault();
        
        if (!mensajeMasivo.grupo || !mensajeMasivo.asunto || !mensajeMasivo.contenido) {
            alert('Por favor complete todos los campos');
            return;
        }
        
        setEnviando(true);
        try {
            const token = localStorage.getItem('token');
            
            let destinatariosIds = [];
            const grupoSeleccionado = gruposMasivos.find(g => g.id === mensajeMasivo.grupo);
            
            if (grupoSeleccionado) {
                if (grupoSeleccionado.id === 'todos') {
                    destinatariosIds = usuarios
                        .filter(u => u._id !== user.id)
                        .map(u => u._id);
                } else {
                    destinatariosIds = usuarios
                        .filter(u => u.rol === grupoSeleccionado.rol && u._id !== user.id)
                        .map(u => u._id);
                }
            }
            
            if (destinatariosIds.length === 0) {
                alert('No hay destinatarios en el grupo seleccionado');
                setEnviando(false);
                return;
            }
            
            if (!confirm(`¿Enviar mensaje a ${destinatariosIds.length} destinatarios?`)) {
                setEnviando(false);
                return;
            }
            
            let enviados = 0;
            let errores = 0;
            
            for (const destinatarioId of destinatariosIds) {
                try {
                    const response = await fetch('http://localhost:5000/api/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            remitenteId: user.id,
                            destinatarioId: destinatarioId,
                            asunto: mensajeMasivo.asunto,
                            contenido: mensajeMasivo.contenido
                        })
                    });
                    
                    if (response.ok) {
                        enviados++;
                    } else {
                        errores++;
                    }
                } catch (err) {
                    errores++;
                }
            }
            
            alert(`✅ Mensaje enviado a ${enviados} destinatarios${errores > 0 ? `, ${errores} errores` : ''}`);
            setMensajeMasivo({ grupo: '', asunto: '', contenido: '' });
            setActiveTab('enviados');
            fetchMensajesEnviados();
            
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión con el servidor');
        } finally {
            setEnviando(false);
        }
    };

    const marcarComoLeido = async (messageId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/messages/read/${messageId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchMensajesRecibidos();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRolTexto = (rol) => {
        switch(rol) {
            case 'docente': return 'Docente';
            case 'acudiente': return 'Acudiente';
            case 'directivo': return 'Directivo';
            case 'admin': return 'Administrador';
            default: return rol;
        }
    };

    const getGrupoTexto = (grupo) => {
        switch(grupo) {
            case 'docentes': return 'Todos los Docentes';
            case 'acudientes': return 'Todos los Acudientes';
            case 'directivos': return 'Todos los Directivos';
            case 'todos': return 'Toda la Comunidad Educativa';
            default: return grupo;
        }
    };

    const destinatariosDisponibles = usuarios.filter(u => 
        u.rol === 'docente' || u.rol === 'directivo' || u.rol === 'acudiente'
    );

    // Paginación para recibidos
    const recibidosPaginados = mensajes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPagesRecibidos = Math.ceil(mensajes.length / itemsPerPage);
    
    // Paginación para enviados
    const enviadosPaginados = mensajesEnviados.slice((currentPageEnviados - 1) * itemsPerPage, currentPageEnviados * itemsPerPage);
    const totalPagesEnviados = Math.ceil(mensajesEnviados.length / itemsPerPage);

    if (loading && activeTab !== 'nuevo' && activeTab !== 'masivo') {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p>Cargando mensajes...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Mensajería Institucional</h2>
            <p style={styles.pageSubtitle}>Centro de comunicaciones del sistema</p>
            
            {errorMsg && (
                <div style={styles.errorMsg}>
                    ⚠️ {errorMsg}
                    <button onClick={() => setErrorMsg('')} style={styles.closeError}>×</button>
                </div>
            )}
            
            <div style={styles.tabsContainer}>
                <button
                    style={{...styles.tab, ...(activeTab === 'recibidos' && styles.activeTab)}}
                    onClick={() => setActiveTab('recibidos')}
                >
                    Recibidos {mensajes.filter(m => !m.leido).length > 0 && 
                        <span style={styles.badgeCount}>{mensajes.filter(m => !m.leido).length}</span>
                    }
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
                <button
                    style={{...styles.tab, ...(activeTab === 'masivo' && styles.activeTab)}}
                    onClick={() => setActiveTab('masivo')}
                >
                    Mensaje Masivo
                </button>
            </div>
            
            <div style={styles.contentCard}>
                {/* Recibidos con paginación */}
                {activeTab === 'recibidos' && (
                    <>
                        <div style={styles.mensajesList}>
                            {recibidosPaginados.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <p>📭 No hay mensajes recibidos</p>
                                </div>
                            ) : (
                                recibidosPaginados.map((msg) => (
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
                                                <strong>{msg.remitenteId?.nombre || 'Remitente'}</strong>
                                                <span style={styles.mensajeRol}>
                                                    {getRolTexto(msg.remitenteId?.rol)}
                                                </span>
                                                {!msg.leido && <span style={styles.noLeidoBadge}>Nuevo</span>}
                                            </span>
                                            <span style={styles.mensajeHora}>
                                                {formatDate(msg.fechaEnvio || msg.createdAt)}
                                            </span>
                                        </div>
                                        <h4 style={styles.mensajeAsunto}>{msg.asunto}</h4>
                                        <p style={styles.mensajePreview}>{msg.contenido}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {/* Paginación Recibidos */}
                        {totalPagesRecibidos > 1 && (
                            <div style={styles.pagination}>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={styles.pageButton}
                                >
                                    Anterior
                                </button>
                                <span style={styles.pageInfo}>
                                    Página {currentPage} de {totalPagesRecibidos} ({mensajes.length} mensajes)
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPagesRecibidos, p + 1))}
                                    disabled={currentPage === totalPagesRecibidos}
                                    style={styles.pageButton}
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
                
                {/* Enviados con paginación */}
                {activeTab === 'enviados' && (
                    <>
                        <div style={styles.mensajesList}>
                            {enviadosPaginados.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <p>📤 No hay mensajes enviados</p>
                                </div>
                            ) : (
                                enviadosPaginados.map((msg) => (
                                    <div key={msg._id} style={styles.mensajeItem}>
                                        <div style={styles.mensajeHeader}>
                                            <span style={styles.mensajeRemitente}>
                                                Para: <strong>{msg.destinatarioId?.nombre || 'Destinatario'}</strong>
                                                <span style={styles.mensajeRol}>
                                                    {getRolTexto(msg.destinatarioId?.rol)}
                                                </span>
                                            </span>
                                            <span style={styles.mensajeHora}>
                                                {formatDate(msg.fechaEnvio || msg.createdAt)}
                                            </span>
                                        </div>
                                        <h4 style={styles.mensajeAsunto}>{msg.asunto}</h4>
                                        <p style={styles.mensajePreview}>{msg.contenido}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {/* Paginación Enviados */}
                        {totalPagesEnviados > 1 && (
                            <div style={styles.pagination}>
                                <button
                                    onClick={() => setCurrentPageEnviados(p => Math.max(1, p - 1))}
                                    disabled={currentPageEnviados === 1}
                                    style={styles.pageButton}
                                >
                                    Anterior
                                </button>
                                <span style={styles.pageInfo}>
                                    Página {currentPageEnviados} de {totalPagesEnviados} ({mensajesEnviados.length} mensajes)
                                </span>
                                <button
                                    onClick={() => setCurrentPageEnviados(p => Math.min(totalPagesEnviados, p + 1))}
                                    disabled={currentPageEnviados === totalPagesEnviados}
                                    style={styles.pageButton}
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
                
                {/* Nuevo Mensaje Individual */}
                {activeTab === 'nuevo' && (
                    <form onSubmit={handleEnviarMensaje} style={styles.formContainer}>
                        <h3 style={styles.formTitle}>Nuevo Mensaje</h3>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Destinatario *</label>
                            <select
                                style={styles.select}
                                value={nuevoMensaje.destinatarioId}
                                onChange={(e) => setNuevoMensaje({...nuevoMensaje, destinatarioId: e.target.value})}
                                required
                            >
                                <option value="">Seleccione un destinatario</option>
                                {destinatariosDisponibles.map(u => (
                                    <option key={u._id} value={u._id}>
                                        {u.nombre} ({getRolTexto(u.rol)})
                                    </option>
                                ))}
                            </select>
                            {destinatariosDisponibles.length === 0 && (
                                <small style={styles.helpText}>No hay destinatarios disponibles</small>
                            )}
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Asunto *</label>
                            <input
                                type="text"
                                style={styles.input}
                                placeholder="Ingrese el asunto del mensaje"
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
                        
                        <button type="submit" style={styles.sendButton} disabled={enviando}>
                            {enviando ? 'Enviando...' : '📧 Enviar Mensaje'}
                        </button>
                    </form>
                )}
                
                {/* Mensaje Masivo */}
                {activeTab === 'masivo' && (
                    <form onSubmit={handleEnviarMensajeMasivo} style={styles.formContainer}>
                        <h3 style={styles.formTitle}>Mensaje Masivo</h3>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Grupo Destinatario *</label>
                            <select
                                style={styles.select}
                                value={mensajeMasivo.grupo}
                                onChange={(e) => setMensajeMasivo({...mensajeMasivo, grupo: e.target.value})}
                                required
                            >
                                <option value="">Seleccione el grupo</option>
                                {gruposMasivos.map(g => (
                                    <option key={g.id} value={g.id}>{g.label}</option>
                                ))}
                            </select>
                            {mensajeMasivo.grupo && (
                                <small style={styles.helpText}>
                                    El mensaje se enviará a: {getGrupoTexto(mensajeMasivo.grupo)}
                                </small>
                            )}
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Asunto *</label>
                            <input
                                type="text"
                                style={styles.input}
                                placeholder="Ingrese el asunto del mensaje"
                                value={mensajeMasivo.asunto}
                                onChange={(e) => setMensajeMasivo({...mensajeMasivo, asunto: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mensaje *</label>
                            <textarea
                                style={styles.textarea}
                                rows="6"
                                placeholder="Escriba su mensaje aquí..."
                                value={mensajeMasivo.contenido}
                                onChange={(e) => setMensajeMasivo({...mensajeMasivo, contenido: e.target.value})}
                                required
                            />
                        </div>
                        
                        <button type="submit" style={styles.masivoButton} disabled={enviando}>
                            {enviando ? 'Enviando...' : '📢 Enviar Mensaje Masivo'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '900px',
        margin: '0 auto'
    },
    pageTitle: {
        margin: '0 0 5px 0',
        fontSize: '28px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    pageSubtitle: {
        margin: '0 0 24px 0',
        fontSize: '14px',
        color: '#7f8c8d'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
    },
    loadingSpinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #27ae60',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '15px'
    },
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
    closeError: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#c53030'
    },
    tabsContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #ecf0f1',
        paddingBottom: '10px',
        flexWrap: 'wrap'
    },
    tab: {
        padding: '10px 24px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '15px',
        color: '#7f8c8d',
        borderRadius: '5px 5px 0 0',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    activeTab: {
        color: '#27ae60',
        borderBottom: '2px solid #27ae60',
        fontWeight: 'bold'
    },
    badgeCount: {
        backgroundColor: '#e74c3c',
        color: 'white',
        fontSize: '11px',
        padding: '2px 6px',
        borderRadius: '10px'
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
        gap: '15px',
        maxHeight: '500px',
        overflowY: 'auto',
        paddingRight: '5px'
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
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
    },
    mensajeRol: {
        fontSize: '11px',
        color: '#7f8c8d',
        backgroundColor: '#ecf0f1',
        padding: '2px 8px',
        borderRadius: '12px'
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
    formTitle: {
        margin: '0 0 20px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        borderBottom: '2px solid #27ae60',
        paddingBottom: '8px'
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
        fontSize: '11px',
        color: '#7f8c8d',
        display: 'block'
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
        transition: 'all 0.2s'
    },
    masivoButton: {
        padding: '12px 24px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.2s'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #ecf0f1'
    },
    pageButton: {
        padding: '8px 16px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    pageInfo: {
        color: '#2c3e50',
        fontSize: '14px'
    }
};

// Animación para el spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default DirectivoMensajeria;
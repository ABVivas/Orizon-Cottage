// Frontend/src/Pages/DirectivoMensajeria.jsx
import { useState } from 'react';

const DirectivoMensajeria = () => {
    const [activeTab, setActiveTab] = useState('nuevo');
    const [mensaje, setMensaje] = useState({
        grupo: '',
        asunto: '',
        contenido: ''
    });

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Mensajería Institucional</h2>
            <p style={styles.pageSubtitle}>Centro de comunicaciones del sistema</p>

            {/* Tabs */}
            <div style={styles.tabsContainer}>
                <button style={{...styles.tab, ...(activeTab === 'recibidos' && styles.activeTab)}} onClick={() => setActiveTab('recibidos')}>Recibidos</button>
                <button style={{...styles.tab, ...(activeTab === 'enviados' && styles.activeTab)}} onClick={() => setActiveTab('enviados')}>Enviados</button>
                <button style={{...styles.tab, ...(activeTab === 'nuevo' && styles.activeTab)}} onClick={() => setActiveTab('nuevo')}>Nuevo Mensaje</button>
                <button style={{...styles.tab, ...(activeTab === 'masivo' && styles.activeTab)}} onClick={() => setActiveTab('masivo')}>Mensaje Masivo</button>
            </div>

            {/* Contenido según tab */}
            <div style={styles.contentCard}>
                {activeTab === 'nuevo' && (
                    <div style={styles.formContainer}>
                        <h3 style={styles.formTitle}>Nuevo Mensaje</h3>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Destinatario</label>
                            <select style={styles.select}>
                                <option>Seleccione destinatario</option>
                                <option>Docentes</option>
                                <option>Acudientes</option>
                                <option>Directivos</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Asunto</label>
                            <input type="text" style={styles.input} placeholder="Ingrese el asunto del mensaje" />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mensaje</label>
                            <textarea style={styles.textarea} rows="5" placeholder="Escriba su mensaje aquí..."></textarea>
                        </div>
                        <button style={styles.sendButton}>Enviar Mensaje</button>
                    </div>
                )}

                {activeTab === 'masivo' && (
                    <div style={styles.formContainer}>
                        <h3 style={styles.formTitle}>Mensaje Masivo</h3>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Grupo Destinatario</label>
                            <select style={styles.select} value={mensaje.grupo} onChange={(e) => setMensaje({...mensaje, grupo: e.target.value})}>
                                <option value="">Seleccione el grupo</option>
                                <option value="docentes">Todos los Docentes</option>
                                <option value="acudientes">Todos los Acudientes</option>
                                <option value="estudiantes">Todos los Estudiantes</option>
                                <option value="todo">Toda la comunidad</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Asunto</label>
                            <input type="text" style={styles.input} placeholder="Ingrese el asunto del mensaje" value={mensaje.asunto} onChange={(e) => setMensaje({...mensaje, asunto: e.target.value})} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mensaje</label>
                            <textarea style={styles.textarea} rows="5" placeholder="Escriba su mensaje aquí..." value={mensaje.contenido} onChange={(e) => setMensaje({...mensaje, contenido: e.target.value})}></textarea>
                        </div>
                        <button style={styles.masivoButton}>Enviar Mensaje Masivo</button>
                    </div>
                )}

                {(activeTab === 'recibidos' || activeTab === 'enviados') && (
                    <div style={styles.emptyState}>
                        <p>No hay mensajes {activeTab === 'recibidos' ? 'recibidos' : 'enviados'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px' },
    pageTitle: { margin: '0 0 5px 0', fontSize: '24px', color: '#2c3e50' },
    pageSubtitle: { margin: '0 0 25px 0', fontSize: '14px', color: '#7f8c8d' },
    tabsContainer: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' },
    tab: { padding: '10px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '15px', color: '#7f8c8d', borderRadius: '5px 5px 0 0' },
    activeTab: { color: '#27ae60', borderBottom: '2px solid #27ae60', fontWeight: 'bold' },
    contentCard: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '25px' },
    formContainer: { maxWidth: '600px' },
    formTitle: { margin: '0 0 20px 0', fontSize: '18px', color: '#2c3e50', paddingBottom: '10px', borderBottom: '2px solid #27ae60' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: '500', color: '#2c3e50' },
    select: { width: '100%', padding: '12px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px' },
    input: { width: '100%', padding: '12px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px' },
    textarea: { width: '100%', padding: '12px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' },
    sendButton: { padding: '12px 24px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' },
    masivoButton: { padding: '12px 24px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' },
    emptyState: { textAlign: 'center', padding: '40px', color: '#95a5a6', fontSize: '16px' }
};

export default DirectivoMensajeria;
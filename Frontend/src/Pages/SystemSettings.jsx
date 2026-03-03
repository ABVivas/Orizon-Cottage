// Frontend/src/Pages/SystemSettings.jsx
import { useState, useEffect } from 'react';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        institutionName: 'Institución Educativa La Cabaña',
        academicYear: '2026',
        defaultPassword: 'Cambiar123*',
        allowSelfRegistration: false,
        requirePasswordChange: true,
        maxLoginAttempts: 3,
        sessionTimeout: 30,
        enableNotifications: true,
        enableMessaging: true,
        enableAttendance: true,
        enableObservations: true
    });

    const [activeTab, setActiveTab] = useState('general');

    const handleSave = () => {
        // Aquí iría la lógica para guardar en backend
        alert('Configuración guardada exitosamente');
    };

    const handleReset = () => {
        // Resetear a valores por defecto
        setSettings({
            institutionName: 'Institución Educativa La Cabaña',
            academicYear: '2026',
            defaultPassword: 'Cambiar123*',
            allowSelfRegistration: false,
            requirePasswordChange: true,
            maxLoginAttempts: 3,
            sessionTimeout: 30,
            enableNotifications: true,
            enableMessaging: true,
            enableAttendance: true,
            enableObservations: true
        });
    };

    return (
        <div>
            <h2 style={styles.title}>Configuración del Sistema</h2>

            <div style={styles.tabs}>
                <button 
                    style={{...styles.tab, ...(activeTab === 'general' && styles.activeTab)}}
                    onClick={() => setActiveTab('general')}
                >
                    General
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'security' && styles.activeTab)}}
                    onClick={() => setActiveTab('security')}
                >
                    Seguridad
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'modules' && styles.activeTab)}}
                    onClick={() => setActiveTab('modules')}
                >
                    Módulos
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'backup' && styles.activeTab)}}
                    onClick={() => setActiveTab('backup')}
                >
                    Backup
                </button>
            </div>

            <div style={styles.content}>
                {activeTab === 'general' && (
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Configuración General</h3>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nombre de la Institución</label>
                            <input
                                type="text"
                                value={settings.institutionName}
                                onChange={(e) => setSettings({...settings, institutionName: e.target.value})}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Año Académico</label>
                            <select
                                value={settings.academicYear}
                                onChange={(e) => setSettings({...settings, academicYear: e.target.value})}
                                style={styles.select}
                            >
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <input
                                    type="checkbox"
                                    checked={settings.allowSelfRegistration}
                                    onChange={(e) => setSettings({...settings, allowSelfRegistration: e.target.checked})}
                                    style={styles.checkbox}
                                />
                                Permitir auto-registro de usuarios
                            </label>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <input
                                    type="checkbox"
                                    checked={settings.requirePasswordChange}
                                    onChange={(e) => setSettings({...settings, requirePasswordChange: e.target.checked})}
                                    style={styles.checkbox}
                                />
                                Obligar cambio de contraseña en primer inicio
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Configuración de Seguridad</h3>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Contraseña por defecto</label>
                            <input
                                type="text"
                                value={settings.defaultPassword}
                                onChange={(e) => setSettings({...settings, defaultPassword: e.target.value})}
                                style={styles.input}
                            />
                            <small style={styles.helpText}>
                                Esta contraseña se usará para nuevos usuarios
                            </small>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Intentos máximos de login</label>
                            <input
                                type="number"
                                value={settings.maxLoginAttempts}
                                onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                                style={styles.input}
                                min="1"
                                max="10"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Timeout de sesión (minutos)</label>
                            <input
                                type="number"
                                value={settings.sessionTimeout}
                                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                                style={styles.input}
                                min="5"
                                max="120"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'modules' && (
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Módulos Activos</h3>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <input
                                    type="checkbox"
                                    checked={settings.enableAttendance}
                                    onChange={(e) => setSettings({...settings, enableAttendance: e.target.checked})}
                                    style={styles.checkbox}
                                />
                                Control de Asistencia
                            </label>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <input
                                    type="checkbox"
                                    checked={settings.enableObservations}
                                    onChange={(e) => setSettings({...settings, enableObservations: e.target.checked})}
                                    style={styles.checkbox}
                                />
                                Observador Digital
                            </label>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <input
                                    type="checkbox"
                                    checked={settings.enableMessaging}
                                    onChange={(e) => setSettings({...settings, enableMessaging: e.target.checked})}
                                    style={styles.checkbox}
                                />
                                Mensajería Institucional
                            </label>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <input
                                    type="checkbox"
                                    checked={settings.enableNotifications}
                                    onChange={(e) => setSettings({...settings, enableNotifications: e.target.checked})}
                                    style={styles.checkbox}
                                />
                                Notificaciones
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'backup' && (
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Respaldo de Datos</h3>
                        
                        <div style={styles.backupOptions}>
                            <button style={styles.backupButton}>
                                💾 Respaldo Manual
                            </button>
                            <button style={styles.restoreButton}>
                                🔄 Restaurar Respaldo
                            </button>
                        </div>

                        <div style={styles.backupList}>
                            <h4>Respaldos disponibles</h4>
                            <p style={styles.placeholder}>No hay respaldos disponibles</p>
                        </div>
                    </div>
                )}

                <div style={styles.actionButtons}>
                    <button onClick={handleReset} style={styles.resetButton}>
                        Restablecer
                    </button>
                    <button onClick={handleSave} style={styles.saveButton}>
                        Guardar Configuración
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    title: {
        color: '#2c3e50',
        marginBottom: '30px',
        fontSize: '22px'
    },
    tabs: {
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
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    section: {
        marginBottom: '30px'
    },
    sectionTitle: {
        margin: '0 0 20px 0',
        color: '#2c3e50',
        fontSize: '18px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        color: '#2c3e50',
        fontSize: '14px'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    select: {
        width: '100%',
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    checkbox: {
        marginRight: '10px'
    },
    helpText: {
        display: 'block',
        marginTop: '5px',
        color: '#7f8c8d',
        fontSize: '12px'
    },
    backupOptions: {
        display: 'flex',
        gap: '15px',
        marginBottom: '30px'
    },
    backupButton: {
        padding: '12px 25px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px'
    },
    restoreButton: {
        padding: '12px 25px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px'
    },
    backupList: {
        borderTop: '1px solid #ecf0f1',
        paddingTop: '20px'
    },
    placeholder: {
        textAlign: 'center',
        color: '#95a5a6',
        padding: '20px'
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '15px',
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #ecf0f1'
    },
    resetButton: {
        padding: '10px 20px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    saveButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    }
};

export default SystemSettings;
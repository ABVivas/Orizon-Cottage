// Frontend/src/Pages/AdminSettings.jsx
import { useState, useEffect } from 'react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        institutionName: 'Institución Educativa La Cabaña',
        academicYear: '2026',
        enableAttendance: true,
        enableObservations: true,
        enableMessaging: true
    });
    
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Cargar configuración guardada al iniciar
    useEffect(() => {
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings(parsed);
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }
    }, []);

    const handleSave = () => {
        setSaving(true);
        setSaveSuccess(false);
        
        // Guardar en localStorage
        localStorage.setItem('adminSettings', JSON.stringify(settings));
        
        // También guardar en sessionStorage para que esté disponible en toda la app
        sessionStorage.setItem('appSettings', JSON.stringify(settings));
        
        setTimeout(() => {
            setSaving(false);
            setSaveSuccess(true);
            
            // Recargar la página para aplicar cambios en todos los componentes
            setTimeout(() => {
                if (confirm('Configuración guardada. ¿Desea recargar la página para aplicar los cambios?')) {
                    window.location.reload();
                }
            }, 500);
            
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 500);
    };

    const handleReset = () => {
        if (confirm('¿Está seguro de resetear la configuración a los valores predeterminados?')) {
            const defaultSettings = {
                institutionName: 'Institución Educativa La Cabaña',
                academicYear: '2026',
                enableAttendance: true,
                enableObservations: true,
                enableMessaging: true
            };
            setSettings(defaultSettings);
            localStorage.setItem('adminSettings', JSON.stringify(defaultSettings));
            sessionStorage.setItem('appSettings', JSON.stringify(defaultSettings));
            alert('✅ Configuración restablecida. La página se recargará.');
            window.location.reload();
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Configuración del Sistema</h2>
            <p style={styles.subtitle}>Personalice los parámetros de la aplicación</p>
            
            {saveSuccess && (
                <div style={styles.successMessage}>
                    ✅ Configuración guardada exitosamente
                </div>
            )}
            
            <div style={styles.card}>
                {/* Sección Configuración General */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>
                        <span style={styles.sectionIcon}>🏫</span>
                        Configuración General
                    </h3>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Nombre de la Institución</label>
                        <input 
                            type="text" 
                            value={settings.institutionName} 
                            onChange={(e) => setSettings({...settings, institutionName: e.target.value})}
                            style={styles.input}
                            placeholder="Nombre de la institución"
                        />
                        <small style={styles.helpText}>Nombre que aparecerá en los reportes y encabezados</small>
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Año Académico</label>
                        <select 
                            value={settings.academicYear} 
                            onChange={(e) => setSettings({...settings, academicYear: e.target.value})}
                            style={styles.select}
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                            <option value="2028">2028</option>
                        </select>
                        <small style={styles.helpText}>Año lectivo actual para filtros de reportes</small>
                    </div>
                </div>
                
                {/* Sección Módulos Activos */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>
                        <span style={styles.sectionIcon}>⚙️</span>
                        Módulos Activos
                    </h3>
                    <p style={styles.sectionDescription}>
                        Active o desactive los módulos del sistema. Los cambios se aplicarán después de recargar la página.
                    </p>
                    
                    <div style={styles.checkboxGroup}>
                        <label style={styles.checkboxLabel}>
                            <input 
                                type="checkbox" 
                                checked={settings.enableAttendance} 
                                onChange={(e) => setSettings({...settings, enableAttendance: e.target.checked})}
                                style={styles.checkbox}
                            />
                            <span style={styles.checkboxText}>
                                <strong>Control de Inasistencias</strong>
                                <br />
                                <small>Registro diario de asistencia y justificaciones</small>
                            </span>
                        </label>
                    </div>
                    
                    <div style={styles.checkboxGroup}>
                        <label style={styles.checkboxLabel}>
                            <input 
                                type="checkbox" 
                                checked={settings.enableObservations} 
                                onChange={(e) => setSettings({...settings, enableObservations: e.target.checked})}
                                style={styles.checkbox}
                            />
                            <span style={styles.checkboxText}>
                                <strong>Observador Digital</strong>
                                <br />
                                <small>Registro de observaciones disciplinarias y académicas</small>
                            </span>
                        </label>
                    </div>
                    
                    <div style={styles.checkboxGroup}>
                        <label style={styles.checkboxLabel}>
                            <input 
                                type="checkbox" 
                                checked={settings.enableMessaging} 
                                onChange={(e) => setSettings({...settings, enableMessaging: e.target.checked})}
                                style={styles.checkbox}
                            />
                            <span style={styles.checkboxText}>
                                <strong>Mensajería Institucional</strong>
                                <br />
                                <small>Comunicación entre acudientes, docentes y directivos</small>
                            </span>
                        </label>
                    </div>
                </div>
                
                {/* Botones de acción */}
                <div style={styles.buttonGroup}>
                    <button onClick={handleReset} style={styles.resetButton}>
                        🔄 Restablecer Valores
                    </button>
                    <button onClick={handleSave} style={styles.saveButton} disabled={saving}>
                        {saving ? 'Guardando...' : '💾 Guardar Configuración'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '800px',
        margin: '0 auto'
    },
    title: {
        margin: '0 0 5px 0',
        color: '#2c3e50',
        fontSize: '28px',
        fontWeight: '600'
    },
    subtitle: {
        margin: '0 0 24px 0',
        color: '#7f8c8d',
        fontSize: '14px'
    },
    successMessage: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #c3e6cb',
        fontSize: '14px'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden'
    },
    section: {
        padding: '24px',
        borderBottom: '1px solid #ecf0f1'
    },
    sectionTitle: {
        margin: '0 0 20px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    sectionDescription: {
        margin: '0 0 20px 0',
        fontSize: '13px',
        color: '#7f8c8d',
        fontStyle: 'italic'
    },
    sectionIcon: {
        fontSize: '20px'
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
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #dcdfe6',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    },
    select: {
        width: '100%',
        padding: '12px',
        border: '1px solid #dcdfe6',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: 'white',
        cursor: 'pointer'
    },
    helpText: {
        display: 'block',
        fontSize: '11px',
        color: '#7f8c8d',
        marginTop: '4px'
    },
    checkboxGroup: {
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        transition: 'background-color 0.2s'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        cursor: 'pointer'
    },
    checkbox: {
        width: '18px',
        height: '18px',
        marginTop: '2px',
        cursor: 'pointer',
        accentColor: '#27ae60'
    },
    checkboxText: {
        flex: 1,
        fontSize: '14px',
        color: '#2c3e50',
        lineHeight: '1.4'
    },
    buttonGroup: {
        padding: '24px',
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        backgroundColor: '#f8f9fa'
    },
    resetButton: {
        padding: '10px 20px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s'
    },
    saveButton: {
        padding: '10px 24px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s'
    }
};

export default AdminSettings;
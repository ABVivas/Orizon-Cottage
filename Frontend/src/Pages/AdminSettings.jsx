// Frontend/src/Pages/AdminSettings.jsx
import { useState } from 'react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        institutionName: 'Institución Educativa La Cabaña',
        academicYear: '2026',
        enableAttendance: true,
        enableObservations: true,
        enableMessaging: true
    });

    const handleSave = () => {
        alert('Configuración guardada exitosamente (próximamente)');
    };

    return (
        <div>
            <h2 style={styles.title}>Configuración del Sistema</h2>
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Configuración General</h3>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre de la Institución</label>
                    <input type="text" value={settings.institutionName} onChange={(e) => setSettings({...settings, institutionName: e.target.value})} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Año Académico</label>
                    <select value={settings.academicYear} onChange={(e) => setSettings({...settings, academicYear: e.target.value})} style={styles.select}>
                        <option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option>
                    </select>
                </div>
                <h3 style={styles.cardTitle}>Módulos Activos</h3>
                <div style={styles.formGroup}><label style={styles.checkboxLabel}><input type="checkbox" checked={settings.enableAttendance} onChange={(e) => setSettings({...settings, enableAttendance: e.target.checked})} /> Control de Asistencia</label></div>
                <div style={styles.formGroup}><label style={styles.checkboxLabel}><input type="checkbox" checked={settings.enableObservations} onChange={(e) => setSettings({...settings, enableObservations: e.target.checked})} /> Observador Digital</label></div>
                <div style={styles.formGroup}><label style={styles.checkboxLabel}><input type="checkbox" checked={settings.enableMessaging} onChange={(e) => setSettings({...settings, enableMessaging: e.target.checked})} /> Mensajería Institucional</label></div>
                <button onClick={handleSave} style={styles.saveButton}>Guardar Configuración</button>
            </div>
        </div>
    );
};

const styles = {
    title: { color: '#2c3e50', marginBottom: '30px', fontSize: '24px', fontWeight: '600' },
    card: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '25px', maxWidth: '600px' },
    cardTitle: { margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#2c3e50', borderBottom: '2px solid #27ae60', paddingBottom: '10px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' },
    input: { width: '100%', padding: '10px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
    select: { width: '100%', padding: '10px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500', color: '#2c3e50' },
    saveButton: { padding: '12px 24px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', marginTop: '20px' }
};

export default AdminSettings;
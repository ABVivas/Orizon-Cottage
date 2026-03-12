// Frontend/src/Pages/DirectivoReportes.jsx
import { useState } from 'react';

const DirectivoReportes = () => {
    const [reporteConfig, setReporteConfig] = useState({
        tipo: '',
        periodo: '',
        fechaInicio: '',
        fechaFin: '',
        cursos: 'todos'
    });

    const reportesRecientes = [
        { nombre: 'Reporte de Asistencia - Octubre 2025', fecha: '2025-10-02 10:30 AM' },
        { nombre: 'Reporte de Observaciones - Septiembre 2025', fecha: '2025-10-01 03:15 PM' }
    ];

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Generación de Reportes</h2>
            <p style={styles.pageSubtitle}>Genere reportes en PDF y Excel</p>

            {/* Configuración */}
            <div style={styles.configCard}>
                <h3 style={styles.cardTitle}>Configuración de Reporte</h3>
                
                <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Tipo de Reporte</label>
                        <select style={styles.select} value={reporteConfig.tipo} onChange={(e) => setReporteConfig({...reporteConfig, tipo: e.target.value})}>
                            <option value="">Seleccione el tipo de reporte</option>
                            <option value="asistencia">Reporte de Asistencia</option>
                            <option value="observaciones">Reporte de Observaciones</option>
                            <option value="general">Reporte General</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Período</label>
                        <select style={styles.select} value={reporteConfig.periodo} onChange={(e) => setReporteConfig({...reporteConfig, periodo: e.target.value})}>
                            <option value="">Seleccione el período</option>
                            <option value="diario">Diario</option>
                            <option value="semanal">Semanal</option>
                            <option value="mensual">Mensual</option>
                            <option value="personalizado">Personalizado</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Fecha de Inicio</label>
                        <input type="date" style={styles.input} value={reporteConfig.fechaInicio} onChange={(e) => setReporteConfig({...reporteConfig, fechaInicio: e.target.value})} />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Fecha de Fin</label>
                        <input type="date" style={styles.input} value={reporteConfig.fechaFin} onChange={(e) => setReporteConfig({...reporteConfig, fechaFin: e.target.value})} />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Cursos (Opcional)</label>
                        <select style={styles.select} value={reporteConfig.cursos} onChange={(e) => setReporteConfig({...reporteConfig, cursos: e.target.value})}>
                            <option value="todos">Todos los cursos</option>
                            <option value="primaria">Primaria</option>
                            <option value="secundaria">Secundaria</option>
                        </select>
                    </div>
                </div>

                <div style={styles.buttonGroup}>
                    <button style={styles.pdfButton}>📄 Descargar PDF</button>
                    <button style={styles.excelButton}>📊 Descargar Excel</button>
                    <button style={styles.previewButton}>🔍 Vista Previa</button>
                </div>
            </div>

            {/* Reportes Recientes */}
            <div style={styles.recientesCard}>
                <h3 style={styles.cardTitle}>Reportes Recientes</h3>
                <div style={styles.recientesList}>
                    {reportesRecientes.map((rep, index) => (
                        <div key={index} style={styles.recienteItem}>
                            <div style={styles.recienteInfo}>
                                <strong>{rep.nombre}</strong>
                                <span style={styles.recienteFecha}>Generado el {rep.fecha}</span>
                            </div>
                            <button style={styles.descargarButton}>📥</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px' },
    pageTitle: { margin: '0 0 5px 0', fontSize: '24px', color: '#2c3e50' },
    pageSubtitle: { margin: '0 0 25px 0', fontSize: '14px', color: '#7f8c8d' },
    configCard: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '20px', marginBottom: '20px' },
    cardTitle: { margin: '0 0 20px 0', fontSize: '18px', color: '#2c3e50', paddingBottom: '10px', borderBottom: '2px solid #27ae60' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontWeight: '500', color: '#2c3e50', fontSize: '13px' },
    select: { padding: '10px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px' },
    input: { padding: '10px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px' },
    buttonGroup: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
    pdfButton: { padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    excelButton: { padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    previewButton: { padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    recientesCard: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '20px' },
    recientesList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    recienteItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' },
    recienteInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
    recienteFecha: { fontSize: '12px', color: '#7f8c8d' },
    descargarButton: { padding: '8px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default DirectivoReportes;
// Frontend/src/Pages/DisciplineReports.jsx
import { useState, useEffect } from 'react';

const DisciplineReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('general');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [summary, setSummary] = useState({
        total: 0,
        leves: 0,
        medios: 0,
        graves: 0,
        academicas: 0,
        disciplinarias: 0
    });

    useEffect(() => {
        fetchReports();
    }, [dateRange, reportType]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5000/api/observations/reports?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&type=${reportType}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            if (data.success) {
                setReports(data.reports);
                calculateSummary(data.reports);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (reportsData) => {
        const summary = {
            total: reportsData.length,
            leves: reportsData.filter(r => r.gravedad === 'Leve').length,
            medios: reportsData.filter(r => r.gravedad === 'Medio').length,
            graves: reportsData.filter(r => r.gravedad === 'Grave').length,
            academicas: reportsData.filter(r => r.tipo === 'Académica').length,
            disciplinarias: reportsData.filter(r => r.tipo === 'Disciplinaria').length
        };
        setSummary(summary);
    };

    const exportToPDF = () => {
        // Aquí iría la lógica para exportar a PDF
        alert('Función de exportación a PDF (próximamente)');
    };

    const exportToExcel = () => {
        // Aquí iría la lógica para exportar a Excel
        alert('Función de exportación a Excel (próximamente)');
    };

    return (
        <div>
            <div style={styles.header}>
                <h2 style={styles.title}>Reportes de Convivencia</h2>
                <div style={styles.headerButtons}>
                    <button onClick={exportToPDF} style={styles.exportButton}>
                        📄 PDF
                    </button>
                    <button onClick={exportToExcel} style={styles.exportButton}>
                        📊 Excel
                    </button>
                </div>
            </div>
            
            <div style={styles.filters}>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Tipo de Reporte:</label>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        style={styles.select}
                    >
                        <option value="general">General</option>
                        <option value="academica">Académicas</option>
                        <option value="disciplinaria">Disciplinarias</option>
                        <option value="por-grado">Por Grado</option>
                        <option value="por-estudiante">Por Estudiante</option>
                    </select>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Fecha Inicio:</label>
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                        style={styles.dateInput}
                    />
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Fecha Fin:</label>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                        style={styles.dateInput}
                    />
                </div>

                <button 
                    onClick={fetchReports}
                    style={styles.generateButton}
                >
                    Generar Reporte
                </button>
            </div>

            {/* Resumen de estadísticas */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{summary.total}</span>
                    <span style={styles.statLabel}>Total Observaciones</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#27ae60'}}>
                    <span style={styles.statValue}>{summary.leves}</span>
                    <span style={styles.statLabel}>Leves</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#f39c12'}}>
                    <span style={styles.statValue}>{summary.medios}</span>
                    <span style={styles.statLabel}>Medias</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#e74c3c'}}>
                    <span style={styles.statValue}>{summary.graves}</span>
                    <span style={styles.statLabel}>Graves</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#3498db'}}>
                    <span style={styles.statValue}>{summary.academicas}</span>
                    <span style={styles.statLabel}>Académicas</span>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#9b59b6'}}>
                    <span style={styles.statValue}>{summary.disciplinarias}</span>
                    <span style={styles.statLabel}>Disciplinarias</span>
                </div>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Fecha</th>
                                <th style={styles.th}>Estudiante</th>
                                <th style={styles.th}>Grado</th>
                                <th style={styles.th}>Tipo</th>
                                <th style={styles.th}>Gravedad</th>
                                <th style={styles.th}>Descripción</th>
                                <th style={styles.th}>Docente</th>
                                <th style={styles.th}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length > 0 ? (
                                reports.map((report, index) => (
                                    <tr key={index} style={styles.tr}>
                                        <td style={styles.td}>{new Date(report.fecha).toLocaleDateString()}</td>
                                        <td style={styles.td}>{report.estudiante}</td>
                                        <td style={styles.td}>{report.grado}</td>
                                        <td style={styles.td}>{report.tipo}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.severityBadge,
                                                backgroundColor: report.gravedad === 'Leve' ? '#27ae60' :
                                                                report.gravedad === 'Medio' ? '#f39c12' : '#e74c3c'
                                            }}>
                                                {report.gravedad}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{report.descripcion}</td>
                                        <td style={styles.td}>{report.docente}</td>
                                        <td style={styles.td}>
                                            <span className={`status-badge ${report.estado === 'resuelto' ? 'status-active' : 'status-inactive'}`}>
                                                {report.estado || 'Pendiente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={styles.emptyMessage}>
                                        No hay reportes en el período seleccionado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
    headerButtons: {
        display: 'flex',
        gap: '10px'
    },
    exportButton: {
        padding: '8px 15px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    filters: {
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        alignItems: 'flex-end',
        flexWrap: 'wrap'
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        minWidth: '150px'
    },
    filterLabel: {
        fontWeight: 'bold',
        color: '#2c3e50',
        fontSize: '14px'
    },
    select: {
        padding: '8px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    dateInput: {
        padding: '8px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px'
    },
    generateButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        marginLeft: 'auto'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
    },
    statCard: {
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    statValue: {
        display: 'block',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '5px'
    },
    statLabel: {
        fontSize: '12px',
        opacity: 0.9
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    tableHeader: {
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #27ae60'
    },
    th: {
        padding: '15px',
        textAlign: 'left',
        color: '#2c3e50',
        fontSize: '14px'
    },
    tr: {
        borderBottom: '1px solid #ecf0f1'
    },
    td: {
        padding: '12px 15px',
        fontSize: '14px'
    },
    severityBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-block'
    },
    emptyMessage: {
        textAlign: 'center',
        padding: '40px',
        color: '#95a5a6'
    }
};

export default DisciplineReports;
// Frontend/src/Pages/DirectivoReportes.jsx
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DirectivoReportes = () => {
    const [reportType, setReportType] = useState('asistencia');
    const [period, setPeriod] = useState('mes');
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toLocaleDateString('en-CA');
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toLocaleDateString('en-CA');
    });
    const [selectedCourse, setSelectedCourse] = useState('todos');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [recentReports, setRecentReports] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersMap, setUsersMap] = useState({}); // Mapa de usuarios por ID
    const itemsPerPage = 10;

    const availableCourses = ['todos', '0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];

    // Cargar usuarios para obtener nombres de registradores
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    const map = {};
                    data.users.forEach(user => {
                        map[user._id] = user.nombre;
                        // También mapear por numeroIdentificacion por si acaso
                        if (user.numeroIdentificacion) {
                            map[user.numeroIdentificacion] = user.nombre;
                        }
                    });
                    setUsersMap(map);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const savedReports = localStorage.getItem('directivoRecentReports');
        if (savedReports) {
            setRecentReports(JSON.parse(savedReports));
        }
    }, []);

    useEffect(() => {
        const today = new Date();
        const todayStr = today.toLocaleDateString('en-CA');
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);

        switch(period) {
            case 'hoy':
                setStartDate(todayStr);
                setEndDate(todayStr);
                break;
            case 'ayer':
                setStartDate(yesterday.toLocaleDateString('en-CA'));
                setEndDate(yesterday.toLocaleDateString('en-CA'));
                break;
            case 'semana':
                setStartDate(weekAgo.toLocaleDateString('en-CA'));
                setEndDate(todayStr);
                break;
            case 'mes':
                setStartDate(monthAgo.toLocaleDateString('en-CA'));
                setEndDate(todayStr);
                break;
            default:
                break;
        }
    }, [period]);

    const getStudentInfo = (record) => {
        if (!record.studentId) return { nombre: 'N/A', grado: 'N/A' };
        if (typeof record.studentId === 'object') {
            return {
                nombre: record.studentId.apellido1 || record.studentId.apellido || 'N/A',
                grado: record.studentId.grado_especifico || record.studentId.grado || 'N/A'
            };
        }
        return { nombre: 'N/A', grado: 'N/A' };
    };

    // Función para obtener el nombre del registrador a partir del ID
    const getRegistradorNombre = (registradoPor) => {
        if (!registradoPor || registradoPor === '-') return '-';
        // Si ya es un nombre (no parece un ObjectId), devolverlo
        if (registradoPor.length < 24 || !registradoPor.match(/^[0-9a-fA-F]{24}$/)) {
            return registradoPor;
        }
        // Buscar en el mapa de usuarios
        return usersMap[registradoPor] || registradoPor;
    };

    const formatFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        if (fechaString.match(/^\d{2}\/\d{2}\/\d{4}/)) return fechaString;
        if (fechaString.match(/^\d{4}-\d{2}-\d{2}/)) {
            const [year, month, day] = fechaString.split('-');
            return `${day}/${month}/${year}`;
        }
        try {
            const date = new Date(fechaString);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${day}/${month}/${year}`;
            }
        } catch (e) {}
        return fechaString;
    };

    const fetchAttendanceData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5000/api/attendance/report-range?startDate=${startDate}&endDate=${endDate}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const data = await response.json();
            if (data.success) {
                return data.attendance || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching attendance:', error);
            return [];
        }
    };

    const fetchObservationsData = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('📝 Cargando observaciones desde:', startDate, 'hasta:', endDate);
            
            const response = await fetch(
                `http://localhost:5000/api/observations?startDate=${startDate}&endDate=${endDate}&limit=1000`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            const data = await response.json();
            console.log('📊 Respuesta observaciones:', data);
            
            if (data.success) {
                console.log(`✅ Cargadas ${data.data?.length || 0} observaciones`);
                return data.data || [];
            }
            return [];
        } catch (error) {
            console.error('❌ Error fetching observations:', error);
            return [];
        }
    };

    const generateReport = async () => {
        setLoading(true);
        setCurrentPage(1);
        try {
            console.log('🚀 Generando reporte tipo:', reportType);
            console.log('📅 Fechas:', startDate, 'a', endDate);
            
            if (reportType === 'asistencia') {
                const attendance = await fetchAttendanceData();
                
                let filtered = attendance;
                if (selectedCourse !== 'todos') {
                    filtered = attendance.filter(record => {
                        const info = getStudentInfo(record);
                        return info.grado === selectedCourse;
                    });
                }
                
                const estadoMap = {
                    'presente': 'Presente',
                    'ausente': 'Ausente',
                    'tarde': 'Tardanza'
                };
                const motivoMap = {
                    'enfermedad': 'Enfermedad',
                    'permiso': 'Permiso',
                    'sin_justificar': 'Sin justificar',
                    'otro': 'Otro'
                };
                
                const mappedData = filtered.map(record => {
                    const info = getStudentInfo(record);
                    return {
                        fecha: formatFecha(record.fecha),
                        estudiante: info.nombre,
                        grado: info.grado,
                        estado: estadoMap[record.estado] || record.estado || 'Sin registrar',
                        motivo: motivoMap[record.motivo] || record.motivo || '-',
                        observaciones: record.observacion || '-',
                        registradoPor: getRegistradorNombre(record.registradoPor)
                    };
                });
                
                mappedData.sort((a, b) => {
                    const dateA = a.fecha.split('/').reverse().join('-');
                    const dateB = b.fecha.split('/').reverse().join('-');
                    return new Date(dateB) - new Date(dateA);
                });
                
                setReportData(mappedData);
                
            } else if (reportType === 'observaciones') {
                const observations = await fetchObservationsData();
                
                console.log('📊 Total observaciones recibidas:', observations.length);
                
                let filtered = observations;
                if (selectedCourse !== 'todos') {
                    filtered = observations.filter(record => {
                        const info = getStudentInfo(record);
                        return info.grado === selectedCourse;
                    });
                    console.log('📊 Filtradas por curso:', filtered.length);
                }
                
                const mappedData = filtered.map(record => {
                    const info = getStudentInfo(record);
                    return {
                        fecha: formatFecha(record.fecha),
                        estudiante: info.nombre,
                        grado: info.grado,
                        tipo: record.tipo || '-',
                        nivel: record.nivel || '-',
                        descripcion: record.descripcion || '-',
                        planMejora: record.planMejora || '-'
                    };
                });
                
                mappedData.sort((a, b) => {
                    const dateA = a.fecha.split('/').reverse().join('-');
                    const dateB = b.fecha.split('/').reverse().join('-');
                    return new Date(dateB) - new Date(dateA);
                });
                
                console.log('📊 Datos finales para reporte:', mappedData.length);
                setReportData(mappedData);
                
            } else {
                const [attendance, observations] = await Promise.all([
                    fetchAttendanceData(),
                    fetchObservationsData()
                ]);
                
                const estadoMap = {
                    'presente': 'Presente',
                    'ausente': 'Ausente',
                    'tarde': 'Tardanza'
                };
                
                const attendanceMapped = attendance.map(record => {
                    const info = getStudentInfo(record);
                    return {
                        tipo: 'Asistencia',
                        fecha: formatFecha(record.fecha),
                        estudiante: info.nombre,
                        grado: info.grado,
                        detalle: estadoMap[record.estado] || record.estado || 'Sin registrar',
                        observaciones: record.observacion || '-',
                        registradoPor: getRegistradorNombre(record.registradoPor)
                    };
                });
                
                const observationsMapped = observations.map(record => {
                    const info = getStudentInfo(record);
                    return {
                        tipo: 'Observación',
                        fecha: formatFecha(record.fecha),
                        estudiante: info.nombre,
                        grado: info.grado,
                        detalle: `${record.tipo || 'General'} - ${record.nivel || 'N/A'}`,
                        observaciones: record.descripcion || '-'
                    };
                });
                
                let combined = [...attendanceMapped, ...observationsMapped];
                combined.sort((a, b) => {
                    const dateA = a.fecha.split('/').reverse().join('-');
                    const dateB = b.fecha.split('/').reverse().join('-');
                    return new Date(dateB) - new Date(dateA);
                });
                
                if (selectedCourse !== 'todos') {
                    combined = combined.filter(item => item.grado === selectedCourse);
                }
                
                setReportData(combined);
            }
            
            setShowPreview(true);
            
        } catch (error) {
            console.error('❌ Error generando reporte:', error);
            alert('Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = () => {
        generateReport();
    };

    const handleDownloadExcel = () => {
        if (reportData.length === 0) {
            alert('No hay datos para generar el reporte');
            return;
        }
        
        const ws = XLSX.utils.json_to_sheet(reportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
        
        const fileName = `${reportType}_${startDate}_${endDate}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        saveRecentReport(`${reportType === 'asistencia' ? 'Asistencia' : reportType === 'observaciones' ? 'Observaciones' : 'General'} - ${startDate} al ${endDate}`, 'Excel');
    };

    const handleDownloadPDF = () => {
        if (reportData.length === 0) {
            alert('No hay datos para generar el reporte');
            return;
        }
        
        const doc = new jsPDF();
        const title = `Reporte de ${reportType === 'asistencia' ? 'Asistencia' : reportType === 'observaciones' ? 'Observaciones' : 'General'}`;
        
        doc.setFontSize(16);
        doc.text(title, 14, 15);
        doc.setFontSize(10);
        doc.text(`Período: ${startDate} al ${endDate}`, 14, 25);
        doc.text(`Curso: ${selectedCourse === 'todos' ? 'Todos los cursos' : selectedCourse}`, 14, 32);
        doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 39);
        
        const columns = Object.keys(reportData[0]);
        const rows = reportData.map(item => columns.map(col => {
            let value = item[col];
            if (typeof value === 'string' && value.length > 50) {
                return value.substring(0, 47) + '...';
            }
            return value;
        }));
        
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 45,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [39, 174, 96] }
        });
        
        const fileName = `${reportType}_${startDate}_${endDate}.pdf`;
        doc.save(fileName);
        
        saveRecentReport(`${reportType === 'asistencia' ? 'Asistencia' : reportType === 'observaciones' ? 'Observaciones' : 'General'} - ${startDate} al ${endDate}`, 'PDF');
    };

    const saveRecentReport = (name, format) => {
        const newReport = {
            id: Date.now(),
            name: name,
            format: format,
            date: new Date().toISOString(),
            type: reportType,
            startDate: startDate,
            endDate: endDate,
            course: selectedCourse
        };
        
        const updatedReports = [newReport, ...recentReports].slice(0, 10);
        setRecentReports(updatedReports);
        localStorage.setItem('directivoRecentReports', JSON.stringify(updatedReports));
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

    const totalPages = Math.ceil(reportData.length / itemsPerPage);
    const paginatedData = reportData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Generación de Reportes</h2>
            <p style={styles.subtitle}>Genere reportes en PDF y Excel</p>
            
            <div style={styles.formContainer}>
                <h3 style={styles.sectionTitle}>Configuración de Reporte</h3>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Tipo de Reporte</label>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        style={styles.select}
                    >
                        <option value="asistencia">Reporte de Asistencia</option>
                        <option value="observaciones">Reporte de Observaciones</option>
                        <option value="general">Reporte General</option>
                    </select>
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Período</label>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        style={styles.select}
                    >
                        <option value="hoy">Hoy</option>
                        <option value="ayer">Ayer</option>
                        <option value="semana">Última semana</option>
                        <option value="mes">Último mes</option>
                        <option value="otro">Personalizado</option>
                    </select>
                </div>
                
                <div style={styles.dateRange}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Fecha de Inicio</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={styles.dateInput}
                            disabled={period !== 'otro'}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Fecha de Fin</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={styles.dateInput}
                            disabled={period !== 'otro'}
                        />
                    </div>
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Cursos (Opcional)</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        style={styles.select}
                    >
                        {availableCourses.map(course => (
                            <option key={course} value={course}>
                                {course === 'todos' ? 'Todos los cursos' : course}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div style={styles.buttonGroup}>
                    <button onClick={handlePreview} style={styles.previewButton} disabled={loading}>
                        {loading ? 'Cargando...' : 'Vista Previa'}
                    </button>
                    <button onClick={handleDownloadPDF} style={styles.pdfButton} disabled={loading || reportData.length === 0}>
                        {loading ? 'Cargando...' : 'Descargar PDF'}
                    </button>
                    <button onClick={handleDownloadExcel} style={styles.excelButton} disabled={loading || reportData.length === 0}>
                        {loading ? 'Cargando...' : 'Descargar Excel'}
                    </button>
                </div>
            </div>
            
            {showPreview && (
                <div style={styles.previewContainer}>
                    <h3 style={styles.sectionTitle}>Vista Previa del Reporte</h3>
                    {loading ? (
                        <p style={styles.loadingText}>Cargando datos...</p>
                    ) : reportData.length === 0 ? (
                        <p style={styles.noData}>No hay datos para mostrar en el rango de fechas seleccionado</p>
                    ) : (
                        <>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            {Object.keys(paginatedData[0]).map(key => (
                                                <th key={key} style={styles.th}>
                                                    {key === 'registradoPor' ? 'Registrado por' : key.charAt(0).toUpperCase() + key.slice(1)}
                                                </th>
                                            ))}
                                          </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((item, idx) => (
                                            <tr key={idx} style={styles.tr}>
                                                {Object.values(item).map((value, i) => (
                                                    <td key={i} style={styles.td}>
                                                        {typeof value === 'string' && value.length > 50 
                                                            ? value.substring(0, 47) + '...' 
                                                            : value}
                                                      </td>
                                                ))}
                                              </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {totalPages > 1 && (
                                <div style={styles.pagination}>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        style={styles.pageButton}
                                    >
                                        Anterior
                                    </button>
                                    <span style={styles.pageInfo}>
                                        Página {currentPage} de {totalPages} ({reportData.length} registros)
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        style={styles.pageButton}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
            
            {recentReports.length > 0 && (
                <div style={styles.recentContainer}>
                    <h3 style={styles.sectionTitle}>Reportes Recientes</h3>
                    <div style={styles.recentList}>
                        {recentReports.map(report => (
                            <div 
                                key={report.id} 
                                style={styles.recentItem}
                                onClick={() => {
                                    setReportType(report.type);
                                    setStartDate(report.startDate);
                                    setEndDate(report.endDate);
                                    setSelectedCourse(report.course);
                                    setPeriod('otro');
                                    setTimeout(() => generateReport(), 100);
                                }}
                            >
                                <div style={styles.recentInfo}>
                                    <strong style={styles.recentName}>{report.name}</strong>
                                    <span style={styles.recentDate}>
                                        Generado el {formatDate(report.date)}
                                    </span>
                                    <span style={styles.recentFormat}>{report.format}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    title: {
        margin: '0 0 5px 0',
        fontSize: '28px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    subtitle: {
        margin: '0 0 24px 0',
        fontSize: '14px',
        color: '#7f8c8d'
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '24px'
    },
    sectionTitle: {
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
        padding: '10px 12px',
        border: '1px solid #dcdfe6',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    dateRange: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
    },
    dateInput: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #dcdfe6',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: 'white',
        cursor: 'pointer'
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        marginTop: '20px',
        flexWrap: 'wrap'
    },
    previewButton: {
        padding: '10px 20px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    pdfButton: {
        padding: '10px 20px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    excelButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    previewContainer: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '24px'
    },
    loadingText: {
        textAlign: 'center',
        padding: '40px',
        color: '#7f8c8d'
    },
    tableContainer: {
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
        padding: '12px',
        textAlign: 'left',
        color: '#2c3e50',
        fontSize: '13px',
        fontWeight: '600'
    },
    tr: {
        borderBottom: '1px solid #ecf0f1'
    },
    td: {
        padding: '12px',
        fontSize: '13px'
    },
    noData: {
        textAlign: 'center',
        padding: '40px',
        color: '#95a5a6'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #ecf0f1'
    },
    pageButton: {
        padding: '6px 12px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    pageInfo: {
        fontSize: '12px',
        color: '#2c3e50'
    },
    recentContainer: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    recentList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    recentItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '3px solid #27ae60',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
    },
    recentInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    recentName: {
        fontSize: '14px',
        color: '#2c3e50'
    },
    recentDate: {
        fontSize: '11px',
        color: '#7f8c8d'
    },
    recentFormat: {
        fontSize: '10px',
        backgroundColor: '#ecf0f1',
        padding: '2px 8px',
        borderRadius: '12px',
        display: 'inline-block',
        width: 'fit-content'
    }
};

export default DirectivoReportes;
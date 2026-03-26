// Frontend/src/Pages/AdminReports.jsx
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminReports = () => {
    const [reportType, setReportType] = useState('asistencia');
    const [period, setPeriod] = useState('mes');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCourse, setSelectedCourse] = useState('todos');
    const [allAttendance, setAllAttendance] = useState([]);
    const [allObservations, setAllObservations] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recentReports, setRecentReports] = useState([]);

    const availableCourses = ['0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];

    useEffect(() => {
        const savedReports = localStorage.getItem('recentReports');
        if (savedReports) {
            setRecentReports(JSON.parse(savedReports));
        }
    }, []);

    useEffect(() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
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
                setStartDate(yesterday.toISOString().split('T')[0]);
                setEndDate(yesterday.toISOString().split('T')[0]);
                break;
            case 'semana':
                setStartDate(weekAgo.toISOString().split('T')[0]);
                setEndDate(todayStr);
                break;
            case 'mes':
                setStartDate(monthAgo.toISOString().split('T')[0]);
                setEndDate(todayStr);
                break;
            default:
                break;
        }
    }, [period]);

    const fetchAttendanceData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Usar el nuevo endpoint con rango de fechas
            const attendanceRes = await fetch(
                `http://localhost:5000/api/attendance/report-range?startDate=${startDate}&endDate=${endDate}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            const attendanceData = await attendanceRes.json();
            
            if (attendanceData.success) {
                console.log('📊 Asistencias recibidas:', attendanceData.attendance?.length || 0);
                if (attendanceData.attendance?.length > 0) {
                    console.log('📝 Ejemplo de asistencia:', attendanceData.attendance[0]);
                }
                return attendanceData.attendance || [];
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
            
            // Obtener observaciones con rango de fechas
            const observationsRes = await fetch(
                `http://localhost:5000/api/observations?startDate=${startDate}&endDate=${endDate}&limit=1000`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            const observationsData = await observationsRes.json();
            
            if (observationsData.success) {
                console.log('📝 Observaciones recibidas:', observationsData.data?.length || 0);
                return observationsData.data || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching observations:', error);
            return [];
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Cargar asistencias y observaciones en paralelo
            const [attendance, observations] = await Promise.all([
                fetchAttendanceData(),
                fetchObservationsData()
            ]);
            
            setAllAttendance(attendance);
            setAllObservations(observations);
            
            console.log('✅ Datos cargados:', {
                asistencias: attendance.length,
                observaciones: observations.length
            });
            
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    // Función auxiliar para obtener información del estudiante de manera segura
    const getStudentInfo = (record) => {
        if (!record.studentId) {
            return { nombre: 'N/A', grado: 'N/A', _id: null };
        }
        
        // Caso 1: Es un objeto con datos del estudiante (poblado)
        if (typeof record.studentId === 'object' && record.studentId !== null) {
            if (record.studentId.apellido1 || record.studentId.apellido) {
                return {
                    nombre: record.studentId.apellido1 || record.studentId.apellido || 'N/A',
                    grado: record.studentId.grado_especifico || record.studentId.grado || 'N/A',
                    _id: record.studentId._id
                };
            }
            // Es un objeto pero solo tiene _id
            return {
                nombre: 'Estudiante ID: ' + (record.studentId._id?.toString().slice(-6) || '?'),
                grado: 'N/A',
                _id: record.studentId._id
            };
        }
        
        // Caso 2: Es un string (ObjectId)
        if (typeof record.studentId === 'string') {
            return {
                nombre: 'Estudiante ID: ' + record.studentId.slice(-6),
                grado: 'N/A',
                _id: record.studentId
            };
        }
        
        return { nombre: 'N/A', grado: 'N/A', _id: null };
    };

    const getFilteredData = () => {
        console.log('🔍 Generando reporte - Tipo:', reportType);
        console.log('📅 Rango de fechas:', startDate, 'a', endDate);
        
        // Mapeo de motivos
        const motivoMap = {
            'enfermedad': 'Enfermedad',
            'permiso': 'Permiso',
            'sin_justificar': 'Sin justificar',
            'otro': 'Otro'
        };
        
        const estadoMap = {
            'presente': 'Presente',
            'ausente': 'Ausente',
            'tarde': 'Tardanza'
        };
        
        if (reportType === 'asistencia') {
            let filtered = [...allAttendance];
            
            console.log('📊 Total asistencias en BD:', filtered.length);
            
            // Filtrar por curso si es necesario
            if (selectedCourse !== 'todos') {
                filtered = filtered.filter(record => {
                    const studentInfo = getStudentInfo(record);
                    return studentInfo.grado === selectedCourse;
                });
                console.log('📊 Asistencias filtradas por curso:', filtered.length);
            }
            
            const mappedData = filtered.map(record => {
                const studentInfo = getStudentInfo(record);
                return {
                    fecha: record.fecha ? new Date(record.fecha).toLocaleDateString() : 'N/A',
                    estudiante: studentInfo.nombre,
                    grado: studentInfo.grado,
                    estado: estadoMap[record.estado] || record.estado || 'Sin registrar',
                    motivo: motivoMap[record.motivo] || record.motivo || '-',
                    observaciones: record.observacion || '-',
                    registradoPor: record.registradoPor || '-'
                };
            });
            
            console.log('📊 Datos finales para reporte de asistencia:', mappedData.length);
            return mappedData;
        }
        else if (reportType === 'observaciones') {
            let filtered = [...allObservations];
            
            console.log('📝 Total observaciones en BD:', filtered.length);
            
            // Filtrar por curso si es necesario
            if (selectedCourse !== 'todos') {
                filtered = filtered.filter(record => {
                    const studentInfo = getStudentInfo(record);
                    return studentInfo.grado === selectedCourse;
                });
                console.log('📝 Observaciones filtradas por curso:', filtered.length);
            }
            
            const mappedData = filtered.map(record => {
                const studentInfo = getStudentInfo(record);
                return {
                    fecha: record.fecha ? new Date(record.fecha).toLocaleDateString() : 'N/A',
                    estudiante: studentInfo.nombre,
                    grado: studentInfo.grado,
                    tipo: record.tipo || '-',
                    nivel: record.nivel || '-',
                    descripcion: record.descripcion || '-',
                    planMejora: record.planMejora || '-'
                };
            });
            
            console.log('📝 Datos finales para reporte de observaciones:', mappedData.length);
            return mappedData;
        }
        else {
            // Reporte general
            const attendanceMapped = allAttendance.map(record => {
                const studentInfo = getStudentInfo(record);
                return {
                    tipo: 'Asistencia',
                    fecha: record.fecha ? new Date(record.fecha).toLocaleDateString() : 'N/A',
                    estudiante: studentInfo.nombre,
                    grado: studentInfo.grado,
                    detalle: estadoMap[record.estado] || record.estado || 'Sin registrar',
                    observaciones: record.observacion || '-'
                };
            });
            
            const observationsMapped = allObservations.map(record => {
                const studentInfo = getStudentInfo(record);
                return {
                    tipo: 'Observación',
                    fecha: record.fecha ? new Date(record.fecha).toLocaleDateString() : 'N/A',
                    estudiante: studentInfo.nombre,
                    grado: studentInfo.grado,
                    detalle: `${record.tipo || 'General'} - ${record.nivel || 'N/A'}`,
                    observaciones: record.descripcion || '-'
                };
            });
            
            const combined = [...attendanceMapped, ...observationsMapped];
            combined.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            
            // Filtrar por curso si es necesario
            let filtered = combined;
            if (selectedCourse !== 'todos') {
                filtered = filtered.filter(item => item.grado === selectedCourse);
            }
            
            console.log('📊 Datos finales para reporte general:', filtered.length);
            return filtered;
        }
    };

    const handlePreview = async () => {
        await fetchAllData();
        setShowPreview(true);
    };

    const handleDownloadExcel = async () => {
        await fetchAllData();
        const reportData = getFilteredData();
        
        if (reportData.length === 0) {
            alert('No hay datos para generar el reporte en el rango de fechas seleccionado');
            return;
        }
        
        const ws = XLSX.utils.json_to_sheet(reportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
        
        const fileName = `${reportType}_${startDate}_${endDate}_${selectedCourse}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        saveRecentReport(`${reportType === 'asistencia' ? 'Asistencia' : reportType === 'observaciones' ? 'Observaciones' : 'General'} - ${startDate} al ${endDate}`, 'Excel');
    };

    const handleDownloadPDF = async () => {
        await fetchAllData();
        const reportData = getFilteredData();
        
        if (reportData.length === 0) {
            alert('No hay datos para generar el reporte en el rango de fechas seleccionado');
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
        const rows = reportData.map(item => columns.map(col => item[col]));
        
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 45,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [39, 174, 96] }
        });
        
        const fileName = `${reportType}_${startDate}_${endDate}_${selectedCourse}.pdf`;
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
        localStorage.setItem('recentReports', JSON.stringify(updatedReports));
    };

    const reportData = getFilteredData();

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
                        <option value="general">Reporte General (Asistencia + Observaciones)</option>
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
                        <option value="otro">Otro (personalizado)</option>
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
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Fecha de Fin</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={styles.dateInput}
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
                        <option value="todos">Todos los cursos</option>
                        {availableCourses.map(course => (
                            <option key={course} value={course}>{course}</option>
                        ))}
                    </select>
                </div>
                
                <div style={styles.buttonGroup}>
                    <button onClick={handlePreview} style={styles.previewButton} disabled={loading}>
                        {loading ? 'Cargando...' : '👁️ Vista Previa'}
                    </button>
                    <button onClick={handleDownloadPDF} style={styles.pdfButton} disabled={loading}>
                        {loading ? 'Cargando...' : '📄 Descargar PDF'}
                    </button>
                    <button onClick={handleDownloadExcel} style={styles.excelButton} disabled={loading}>
                        {loading ? 'Cargando...' : '📊 Descargar Excel'}
                    </button>
                </div>
            </div>
            
            {showPreview && (
                <div style={styles.previewContainer}>
                    <h3 style={styles.sectionTitle}>Vista Previa del Reporte</h3>
                    {loading ? (
                        <p>Cargando datos...</p>
                    ) : reportData.length === 0 ? (
                        <p style={styles.noData}>No hay datos para mostrar en el rango de fechas seleccionado</p>
                    ) : (
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeader}>
                                        {reportData.length > 0 && Object.keys(reportData[0]).map(key => (
                                            <th key={key} style={styles.th}>
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.slice(0, 10).map((item, idx) => (
                                        <tr key={idx} style={styles.tr}>
                                            {Object.values(item).map((value, i) => (
                                                <td key={i} style={styles.td}>
                                                    {typeof value === 'string' && value.length > 50 
                                                        ? value.substring(0, 50) + '...' 
                                                        : value}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {reportData.length > 10 && (
                                <p style={styles.moreData}>Mostrando 10 de {reportData.length} registros</p>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            {recentReports.length > 0 && (
                <div style={styles.recentContainer}>
                    <h3 style={styles.sectionTitle}>Reportes Recientes</h3>
                    {recentReports.map(report => (
                        <div key={report.id} style={styles.recentItem}>
                            <div style={styles.recentInfo}>
                                <strong>{report.name}</strong>
                                <span style={styles.recentDate}>
                                    Generado el {new Date(report.date).toLocaleString()}
                                </span>
                                <span style={styles.recentFormat}>{report.format}</span>
                            </div>
                            <button
                                onClick={() => {
                                    setReportType(report.type);
                                    setStartDate(report.startDate);
                                    setEndDate(report.endDate);
                                    setSelectedCourse(report.course);
                                    setPeriod('otro');
                                    setTimeout(() => handlePreview(), 100);
                                }}
                                style={styles.downloadButton}
                            >
                                📥 Descargar
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
    title: { color: '#2c3e50', marginBottom: '10px', fontSize: '24px', fontWeight: '600' },
    subtitle: { color: '#7f8c8d', marginBottom: '30px', fontSize: '14px' },
    formContainer: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' },
    sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '20px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50', fontSize: '14px' },
    select: { width: '100%', padding: '10px', border: '1px solid #bdc3c7', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' },
    dateRange: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
    dateInput: { width: '100%', padding: '10px', border: '1px solid #bdc3c7', borderRadius: '6px', fontSize: '14px' },
    buttonGroup: { display: 'flex', gap: '15px', marginTop: '25px', flexWrap: 'wrap' },
    previewButton: { padding: '12px 24px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    pdfButton: { padding: '12px 24px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    excelButton: { padding: '12px 24px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    previewContainer: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #27ae60' },
    th: { padding: '12px', textAlign: 'left', color: '#2c3e50', fontSize: '13px', fontWeight: 'bold' },
    tr: { borderBottom: '1px solid #ecf0f1' },
    td: { padding: '12px', fontSize: '13px' },
    noData: { textAlign: 'center', padding: '40px', color: '#95a5a6' },
    moreData: { textAlign: 'center', padding: '10px', color: '#7f8c8d', fontSize: '12px' },
    recentContainer: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    recentItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #ecf0f1' },
    recentInfo: { display: 'flex', flexDirection: 'column', gap: '5px' },
    recentDate: { fontSize: '12px', color: '#7f8c8d' },
    recentFormat: { fontSize: '11px', backgroundColor: '#ecf0f1', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', width: 'fit-content' },
    downloadButton: { padding: '8px 16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }
};

export default AdminReports;
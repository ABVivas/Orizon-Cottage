// Frontend/src/Pages/AdminReports.jsx
import { useState, useEffect } from 'react';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('general');
    const [selectedGrado, setSelectedGrado] = useState('todos');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [summary, setSummary] = useState({ total: 0, tipoI: 0, tipoII: 0, tipoIII: 0, academicas: 0, disciplinarias: 0 });

    const grados = ['todos', '0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];

    useEffect(() => { fetchReports(); }, [dateRange, reportType, selectedGrado]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `http://localhost:5000/api/observations?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
            if (reportType !== 'general') url += `&tipo=${reportType === 'academica' ? 'Académica' : 'Disciplinaria'}`;
            if (selectedGrado !== 'todos') url += `&grado=${selectedGrado}`;
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) {
                const observations = data.data || [];
                setReports(observations);
                setSummary({
                    total: observations.length,
                    tipoI: observations.filter(o => o.nivel === 'Tipo I').length,
                    tipoII: observations.filter(o => o.nivel === 'Tipo II').length,
                    tipoIII: observations.filter(o => o.nivel === 'Tipo III').length,
                    academicas: observations.filter(o => o.tipo === 'Académica').length,
                    disciplinarias: observations.filter(o => o.tipo === 'Disciplinaria').length
                });
            }
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const exportToPDF = () => {
        const printWindow = window.open('', '_blank');
        const fecha = new Date().toLocaleDateString('es-ES');
        let htmlContent = `
            <!DOCTYPE html><html><head><title>Reporte de Convivencia - Orizon Cottage</title>
            <style>body{font-family:Arial;margin:40px}h1{color:#27ae60;text-align:center}h2{color:#2c3e50;border-bottom:2px solid #27ae60;padding-bottom:10px}
            table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#27ae60;color:white}
            .summary{display:flex;gap:20px;margin:20px 0;flex-wrap:wrap}.card{background:#f5f5f5;padding:15px;border-radius:8px;text-align:center;flex:1;min-width:100px}
            .card-value{font-size:24px;font-weight:bold;color:#27ae60}.footer{margin-top:30px;text-align:center;font-size:12px;color:#7f8c8d}</style></head><body>
            <h1>ORIZON COTTAGE</h1><h2>Reporte de Convivencia Escolar</h2>
            <p>Período: ${dateRange.startDate} al ${dateRange.endDate}</p><p>Fecha de generación: ${fecha}</p>
            <div class="summary"><div class="card"><div class="card-value">${summary.total}</div><div>Total Observaciones</div></div>
            <div class="card"><div class="card-value">${summary.tipoI}</div><div>Tipo I (Leve)</div></div>
            <div class="card"><div class="card-value">${summary.tipoII}</div><div>Tipo II (Grave)</div></div>
            <div class="card"><div class="card-value">${summary.tipoIII}</div><div>Tipo III (Gravísima)</div></div>
            <div class="card"><div class="card-value">${summary.academicas}</div><div>Académicas</div></div>
            <div class="card"><div class="card-value">${summary.disciplinarias}</div><div>Disciplinarias</div></div></div>
            <table><thead><tr><th>Fecha</th><th>Estudiante</th><th>Grado</th><th>Tipo</th><th>Nivel</th><th>Descripción</th><th>Docente</th></tr></thead><tbody>`;
        reports.forEach(obs => {
            htmlContent += `<tr><td>${new Date(obs.fecha).toLocaleDateString()}</td><td>${obs.studentId?.apellido1 || obs.studentId?.apellido || 'N/A'}</td>
            <td>${obs.studentId?.grado_especifico || 'N/A'}</td><td>${obs.tipo || 'N/A'}</td><td>${obs.nivel || 'N/A'}</td>
            <td>${obs.descripcion?.substring(0, 100) || 'N/A'}</td><td>${obs.docenteId?.nombre || 'N/A'}</td></tr>`;
        });
        htmlContent += `</tbody></table><div class="footer">Reporte generado por Orizon Cottage - Sistema de Gestión de Convivencia</div></body></html>`;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
    };

    const exportToExcel = () => {
        const headers = ['Fecha', 'Estudiante', 'Grado', 'Tipo', 'Nivel', 'Descripción', 'Docente'];
        const rows = reports.map(obs => [
            new Date(obs.fecha).toLocaleDateString(),
            obs.studentId?.apellido1 || obs.studentId?.apellido || 'N/A',
            obs.studentId?.grado_especifico || 'N/A',
            obs.tipo || 'N/A',
            obs.nivel || 'N/A',
            obs.descripcion?.replace(/,/g, ';') || 'N/A',
            obs.docenteId?.nombre || 'N/A'
        ]);
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_convivencia_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('es-ES') : 'N/A';
    const getNivelColor = (nivel) => {
        switch(nivel) { case 'Tipo I': return '#27ae60'; case 'Tipo II': return '#f39c12'; case 'Tipo III': return '#e74c3c'; default: return '#95a5a6'; }
    };

    return (
        <div>
            <div style={styles.header}><h2 style={styles.title}>Reportes de Convivencia</h2>
                <div style={styles.headerButtons}><button onClick={exportToPDF} style={styles.pdfButton}>📄 PDF</button><button onClick={exportToExcel} style={styles.excelButton}>📊 Excel</button></div>
            </div>
            <div style={styles.filters}>
                <div style={styles.filterGroup}><label style={styles.filterLabel}>Tipo de Reporte:</label><select value={reportType} onChange={(e) => setReportType(e.target.value)} style={styles.select}>
                    <option value="general">General</option><option value="academica">Académicas</option><option value="disciplinaria">Disciplinarias</option>
                </select></div>
                <div style={styles.filterGroup}><label style={styles.filterLabel}>Grado:</label><select value={selectedGrado} onChange={(e) => setSelectedGrado(e.target.value)} style={styles.select}>
                    {grados.map(g => <option key={g} value={g}>{g === 'todos' ? 'Todos los grados' : g}</option>)}
                </select></div>
                <div style={styles.filterGroup}><label style={styles.filterLabel}>Fecha Inicio:</label><input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} style={styles.dateInput} /></div>
                <div style={styles.filterGroup}><label style={styles.filterLabel}>Fecha Fin:</label><input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} style={styles.dateInput} /></div>
                <button onClick={fetchReports} style={styles.generateButton}>Generar Reporte</button>
            </div>
            <div style={styles.statsGrid}>
                <div style={styles.statCard}><span style={styles.statValue}>{summary.total}</span><span style={styles.statLabel}>Total Observaciones</span></div>
                <div style={{...styles.statCard, backgroundColor: '#27ae60'}}><span style={styles.statValue}>{summary.tipoI}</span><span style={styles.statLabel}>Tipo I (Leve)</span></div>
                <div style={{...styles.statCard, backgroundColor: '#f39c12'}}><span style={styles.statValue}>{summary.tipoII}</span><span style={styles.statLabel}>Tipo II (Grave)</span></div>
                <div style={{...styles.statCard, backgroundColor: '#e74c3c'}}><span style={styles.statValue}>{summary.tipoIII}</span><span style={styles.statLabel}>Tipo III (Gravísima)</span></div>
                <div style={{...styles.statCard, backgroundColor: '#3498db'}}><span style={styles.statValue}>{summary.academicas}</span><span style={styles.statLabel}>Académicas</span></div>
                <div style={{...styles.statCard, backgroundColor: '#9b59b6'}}><span style={styles.statValue}>{summary.disciplinarias}</span><span style={styles.statLabel}>Disciplinarias</span></div>
            </div>
            {loading ? <p>Cargando reportes...</p> : <div style={styles.tableContainer}><table style={styles.table}><thead><tr style={styles.tableHeader}><th style={styles.th}>Fecha</th><th style={styles.th}>Estudiante</th><th style={styles.th}>Grado</th><th style={styles.th}>Tipo</th><th style={styles.th}>Nivel</th><th style={styles.th}>Descripción</th><th style={styles.th}>Docente</th></tr></thead>
            <tbody>{reports.length > 0 ? reports.map(r => <tr key={r._id} style={styles.tr}><td style={styles.td}>{formatDate(r.fecha)}</td><td style={styles.td}>{r.studentId?.apellido1 || r.studentId?.apellido || 'N/A'}</td>
            <td style={styles.td}>{r.studentId?.grado_especifico || 'N/A'}</td><td style={styles.td}>{r.tipo || 'N/A'}</td>
            <td style={styles.td}><span style={{...styles.nivelBadge, backgroundColor: getNivelColor(r.nivel)}}>{r.nivel || 'N/A'}</span></td>
            <td style={styles.td}>{r.descripcion?.substring(0, 80)}...</td><td style={styles.td}>{r.docenteId?.nombre || 'N/A'}</td></tr>) : <tr><td colSpan="7" style={styles.emptyMessage}>No hay observaciones en el período seleccionado</td></tr>}</tbody></table></div>}
        </div>
    );
};

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { margin: 0, color: '#2c3e50', fontSize: '24px', fontWeight: '600' },
    headerButtons: { display: 'flex', gap: '10px' },
    pdfButton: { padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    excelButton: { padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    filters: { display: 'flex', gap: '20px', marginBottom: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', alignItems: 'flex-end', flexWrap: 'wrap' },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '150px' },
    filterLabel: { fontWeight: '600', color: '#2c3e50', fontSize: '13px' },
    select: { padding: '10px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' },
    dateInput: { padding: '10px', border: '1px solid #dcdfe6', borderRadius: '6px', fontSize: '14px' },
    generateButton: { padding: '10px 24px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginLeft: 'auto' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '30px' },
    statCard: { backgroundColor: '#2c3e50', color: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center' },
    statValue: { display: 'block', fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' },
    statLabel: { fontSize: '12px', opacity: 0.9 },
    tableContainer: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #27ae60' },
    th: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontSize: '14px', fontWeight: '600' },
    tr: { borderBottom: '1px solid #ecf0f1' },
    td: { padding: '12px 15px', fontSize: '14px' },
    nivelBadge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' },
    emptyMessage: { textAlign: 'center', padding: '40px', color: '#95a5a6' }
};

export default AdminReports;
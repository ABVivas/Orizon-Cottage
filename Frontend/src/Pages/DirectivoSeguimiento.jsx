// Frontend/src/Pages/DirectivoSeguimiento.jsx
import { useState, useEffect } from 'react';

const DirectivoSeguimiento = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para filtros
    const [filters, setFilters] = useState({
        curso: 'todos',
        nivel: 'todos',
        tipo: 'todos',
        fecha: ''
    });
    
    // Estados para modales
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [planMejora, setPlanMejora] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [nombreArchivo, setNombreArchivo] = useState('Ningún archivo seleccionado');
    const [saving, setSaving] = useState(false);
    const [documentos, setDocumentos] = useState([]);
    const [observacionesHistorial, setObservacionesHistorial] = useState([]);
    const [historialLoading, setHistorialLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 5;
    
    // Opciones para filtros
    const grados = ['todos', '0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
    const niveles = ['todos', 'Tipo I', 'Tipo II', 'Tipo III'];
    const tipos = ['todos', 'Académica', 'Disciplinaria', 'General'];

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            const params = new URLSearchParams();
            if (filters.curso && filters.curso !== 'todos') params.append('curso', filters.curso);
            if (filters.nivel && filters.nivel !== 'todos') params.append('nivel', filters.nivel);
            if (filters.tipo && filters.tipo !== 'todos') params.append('tipo', filters.tipo);
            if (filters.fecha) params.append('fecha', filters.fecha);
            
            const url = `http://localhost:5000/api/seguimiento?${params.toString()}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const result = await response.json();
            
            if (result.success) {
                setData(result.data);
            } else {
                setError(result.message || 'Error al cargar datos');
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchObservationDetails = async (studentId) => {
        setHistorialLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`http://localhost:5000/api/observations/estudiante/${studentId}?limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            
            if (result.success && result.data) {
                const sortedObservations = [...result.data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setObservacionesHistorial(sortedObservations);
                setTotalPages(Math.ceil(sortedObservations.length / itemsPerPage));
                setCurrentPage(1);
                
                const docs = [];
                sortedObservations.forEach(obs => {
                    if (obs.documentoPlan && obs.documentoPlan.url) {
                        // Extraer solo el nombre del archivo de la URL
                        const urlParts = obs.documentoPlan.url.split('/');
                        const filename = urlParts[urlParts.length - 1];
                        docs.push({
                            nombre: obs.documentoPlan.nombre,
                            filename: filename,
                            url: obs.documentoPlan.url,
                            fecha: obs.documentoPlan.fechaSubida,
                            tipo: obs.documentoPlan.tipo,
                            observacionId: obs._id
                        });
                    }
                });
                setDocumentos(docs);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setHistorialLoading(false);
        }
    };

    const getDocumentUrl = (filename) => {
        // Usar el endpoint de descarga que creamos en el backend
        return `http://localhost:5000/api/download/${encodeURIComponent(filename)}`;
    };

    const getPaginatedObservaciones = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return observacionesHistorial.slice(start, end);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No registrada';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha no válida';
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return 'Fecha no válida';
        }
    };

    const formatDateShort = (dateString) => {
        if (!dateString) return 'No registrada';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha no válida';
            return date.toLocaleDateString('es-ES');
        } catch (e) {
            return 'Fecha no válida';
        }
    };

    const getNivelColor = (nivel) => {
        if (nivel === 'Tipo I') return '#27ae60';
        if (nivel === 'Tipo II') return '#f39c12';
        if (nivel === 'Tipo III') return '#e74c3c';
        return '#95a5a6';
    };

    const getTipoColor = (tipo) => {
        if (tipo === 'Académica') return '#3498db';
        if (tipo === 'Disciplinaria') return '#e74c3c';
        if (tipo === 'General') return '#9b59b6';
        return '#95a5a6';
    };

    const openGenerarPlan = (student) => {
        setSelectedStudent(student);
        setPlanMejora(student.planMejora || '');
        setArchivo(null);
        setNombreArchivo('Ningún archivo seleccionado');
        setShowPlanModal(true);
    };

    const openVerDetalle = async (student) => {
        setSelectedStudent(student);
        setDocumentos([]);
        setObservacionesHistorial([]);
        await fetchObservationDetails(student._id);
        setShowDetailModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('El archivo no puede ser mayor a 5MB');
                e.target.value = '';
                return;
            }
            setArchivo(file);
            setNombreArchivo(file.name);
        } else {
            setArchivo(null);
            setNombreArchivo('Ningún archivo seleccionado');
        }
    };

    const handleGuardarPlan = async () => {
        if (!selectedStudent) return;
        
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            
            const formData = new FormData();
            formData.append('studentId', selectedStudent._id);
            formData.append('docenteId', localStorage.getItem('userId') || '');
            formData.append('tipo', selectedStudent.tipo || 'General');
            formData.append('nivel', selectedStudent.nivel || 'Tipo I');
            formData.append('descripcion', selectedStudent.descripcion || 'Plan de mejora generado por directivo');
            formData.append('planMejora', planMejora);
            
            if (archivo) {
                formData.append('documento', archivo);
            }
            
            const response = await fetch('http://localhost:5000/api/observations/with-file', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (response.ok) {
                alert('✅ Plan de mejora registrado exitosamente');
                setShowPlanModal(false);
                fetchData();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || 'No se pudo registrar el plan'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p>Cargando seguimiento...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <p>Error: {error}</p>
                <button onClick={fetchData} style={styles.retryButton}>Reintentar</button>
            </div>
        );
    }

    const paginatedObservaciones = getPaginatedObservaciones();

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Seguimiento General</h2>
            <p style={styles.pageSubtitle}>Monitoreo de observaciones y correctivos</p>
            
            {/* Filtros */}
            <div style={styles.filtersContainer}>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Curso</label>
                    <select 
                        value={filters.curso} 
                        onChange={(e) => handleFilterChange('curso', e.target.value)}
                        style={styles.filterSelect}
                    >
                        {grados.map(g => (
                            <option key={g} value={g}>{g === 'todos' ? 'Todos los cursos' : g}</option>
                        ))}
                    </select>
                </div>
                
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Nivel de Gravedad</label>
                    <select 
                        value={filters.nivel} 
                        onChange={(e) => handleFilterChange('nivel', e.target.value)}
                        style={styles.filterSelect}
                    >
                        {niveles.map(n => (
                            <option key={n} value={n}>{n === 'todos' ? 'Todos los niveles' : n}</option>
                        ))}
                    </select>
                </div>
                
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Tipo</label>
                    <select 
                        value={filters.tipo} 
                        onChange={(e) => handleFilterChange('tipo', e.target.value)}
                        style={styles.filterSelect}
                    >
                        {tipos.map(t => (
                            <option key={t} value={t}>{t === 'todos' ? 'Todos los tipos' : t}</option>
                        ))}
                    </select>
                </div>
                
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Fecha</label>
                    <input 
                        type="date" 
                        value={filters.fecha} 
                        onChange={(e) => handleFilterChange('fecha', e.target.value)}
                        style={styles.filterInput}
                    />
                </div>
            </div>
            
            {/* Tabla de resultados */}
            <div style={styles.tableContainer}>
                {data.length === 0 ? (
                    <p style={styles.emptyMessage}>No hay estudiantes con observaciones para los filtros seleccionados</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Estudiante</th>
                                <th style={styles.th}>Curso</th>
                                <th style={styles.th}>Tipo</th>
                                <th style={styles.th}>Obs.</th>
                                <th style={styles.th}>Inas.</th>
                                <th style={styles.th}>Nivel</th>
                                <th style={styles.th}>Última Observación</th>
                                <th style={styles.th}>Acciones</th>
                               </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => (
                                <tr key={item._id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <strong>{item.estudiante}</strong>
                                        <br />
                                        <small style={styles.descripcionPreview}>
                                            {item.descripcion?.substring(0, 55)}...
                                        </small>
                                     </td>
                                    <td style={styles.td}>{item.curso}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.tipoBadge,
                                            backgroundColor: getTipoColor(item.tipo)
                                        }}>
                                            {item.tipo}
                                        </span>
                                     </td>
                                    <td style={styles.td}>
                                        <span style={styles.badge}>{item.observaciones}</span>
                                     </td>
                                    <td style={styles.td}>
                                        <span style={styles.badge}>{item.inasistencias}</span>
                                     </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.nivelBadge,
                                            backgroundColor: getNivelColor(item.nivel)
                                        }}>
                                            {item.nivel}
                                        </span>
                                     </td>
                                    <td style={styles.td}>{formatDateShort(item.ultimaObs)}</td>
                                    <td style={styles.td}>
                                        <button 
                                            style={styles.actionButton}
                                            onClick={() => openVerDetalle(item)}
                                        >
                                            Ver Detalle
                                        </button>
                                        <button 
                                            style={styles.planButton}
                                            onClick={() => openGenerarPlan(item)}
                                        >
                                            Generar Plan
                                        </button>
                                     </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            {/* Modal de Detalle Profesional con Historial de Observaciones */}
            {showDetailModal && selectedStudent && (
                <div style={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                    <div style={styles.detailModal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.detailModalHeader}>
                            <h3 style={styles.detailModalTitle}>Detalle de Observación</h3>
                            <button style={styles.modalClose} onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        
                        <div style={styles.detailModalContent}>
                            {/* Encabezado del estudiante */}
                            <div style={styles.studentHeader}>
                                <div style={styles.studentAvatar}>
                                    {selectedStudent.estudiante?.charAt(0) || 'E'}
                                </div>
                                <div style={styles.studentInfo}>
                                    <h4 style={styles.studentName}>{selectedStudent.estudiante}</h4>
                                    <div style={styles.studentMeta}>
                                        <span style={styles.metaBadge}>Curso: {selectedStudent.curso}</span>
                                        <span style={styles.metaBadge}>{selectedStudent.observaciones} observaciones</span>
                                        <span style={styles.metaBadge}>{selectedStudent.inasistencias} inasistencias</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Información de la última observación */}
                            <div style={styles.infoGrid}>
                                <div style={styles.infoCard}>
                                    <div style={styles.infoCardIcon}>📝</div>
                                    <div style={styles.infoCardContent}>
                                        <div style={styles.infoCardLabel}>Tipo de Observación</div>
                                        <div style={styles.infoCardValue}>
                                            <span style={{
                                                ...styles.detailBadge,
                                                backgroundColor: getTipoColor(selectedStudent.tipo)
                                            }}>
                                                {selectedStudent.tipo}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={styles.infoCard}>
                                    <div style={styles.infoCardIcon}>⚠️</div>
                                    <div style={styles.infoCardContent}>
                                        <div style={styles.infoCardLabel}>Nivel de Gravedad</div>
                                        <div style={styles.infoCardValue}>
                                            <span style={{
                                                ...styles.detailBadge,
                                                backgroundColor: getNivelColor(selectedStudent.nivel)
                                            }}>
                                                {selectedStudent.nivel}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={styles.infoCard}>
                                    <div style={styles.infoCardIcon}>👨‍🏫</div>
                                    <div style={styles.infoCardContent}>
                                        <div style={styles.infoCardLabel}>Docente Registrador</div>
                                        <div style={styles.infoCardValue}>{selectedStudent.docente}</div>
                                    </div>
                                </div>
                                
                                <div style={styles.infoCard}>
                                    <div style={styles.infoCardIcon}>📅</div>
                                    <div style={styles.infoCardContent}>
                                        <div style={styles.infoCardLabel}>Fecha de Registro</div>
                                        <div style={styles.infoCardValue}>{formatDate(selectedStudent.ultimaObs)}</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Descripción de la última observación */}
                            <div style={styles.descripcionSection}>
                                <div style={styles.descripcionTitle}>
                                    Descripción de la Observación
                                </div>
                                <div style={styles.descripcionContent}>
                                    {selectedStudent.descripcion || 'No hay descripción disponible'}
                                </div>
                            </div>
                            
                            {/* Documentos adjuntos de todas las observaciones */}
                            <div style={styles.documentsSection}>
                                <div style={styles.documentsTitle}>
                                    Documentos Adjuntos
                                </div>
                                {documentos.length === 0 ? (
                                    <div style={styles.noDocuments}>
                                        No hay documentos adjuntos a las observaciones de este estudiante
                                    </div>
                                ) : (
                                    <div style={styles.documentsList}>
                                        {documentos.map((doc, index) => (
                                            <div key={index} style={styles.documentItem}>
                                                <span style={styles.documentIcon}>📄</span>
                                                <span style={styles.documentName}>{doc.nombre}</span>
                                                <a 
                                                    href={getDocumentUrl(doc.filename)}
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={styles.documentLink}
                                                >
                                                    Ver documento
                                                </a>
                                                <span style={styles.documentDate}>
                                                    {doc.fecha ? formatDateShort(doc.fecha) : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Plan de mejora actual */}
                            <div style={styles.planSection}>
                                <div style={styles.planTitle}>
                                    Plan de Mejora
                                </div>
                                <div style={styles.planContent}>
                                    {selectedStudent.planMejora ? (
                                        selectedStudent.planMejora
                                    ) : (
                                        <span style={styles.noPlanText}>No se ha registrado un plan de mejora para esta observación</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Historial de todas las observaciones */}
                            <div style={styles.historialSection}>
                                <div style={styles.historialTitle}>
                                    Historial de Observaciones
                                    <span style={styles.historialCount}>
                                        {observacionesHistorial.length} registro(s)
                                    </span>
                                </div>
                                
                                {historialLoading ? (
                                    <div style={styles.historialLoading}>
                                        <div style={styles.smallSpinner}></div>
                                        <p>Cargando historial...</p>
                                    </div>
                                ) : observacionesHistorial.length === 0 ? (
                                    <div style={styles.noHistorial}>
                                        No hay observaciones registradas para este estudiante
                                    </div>
                                ) : (
                                    <>
                                        <div style={styles.historialList}>
                                            {paginatedObservaciones.map((obs, index) => {
                                                // Extraer nombre del archivo si existe
                                                let docFilename = null;
                                                if (obs.documentoPlan && obs.documentoPlan.url) {
                                                    const urlParts = obs.documentoPlan.url.split('/');
                                                    docFilename = urlParts[urlParts.length - 1];
                                                }
                                                
                                                return (
                                                    <div key={obs._id} style={styles.historialItem}>
                                                        <div style={styles.historialItemHeader}>
                                                            <span style={styles.historialItemDate}>
                                                                {formatDate(obs.fecha)}
                                                            </span>
                                                            <span style={{
                                                                ...styles.historialBadge,
                                                                backgroundColor: getTipoColor(obs.tipo)
                                                            }}>
                                                                {obs.tipo}
                                                            </span>
                                                            <span style={{
                                                                ...styles.historialBadge,
                                                                backgroundColor: getNivelColor(obs.nivel)
                                                            }}>
                                                                {obs.nivel}
                                                            </span>
                                                        </div>
                                                        <div style={styles.historialItemDesc}>
                                                            {obs.descripcion}
                                                        </div>
                                                        <div style={styles.historialItemFooter}>
                                                            <span>👨‍🏫 {obs.docenteId?.nombre || 'Docente'}</span>
                                                            {obs.planMejora && (
                                                                <span style={styles.hasPlanBadge}>✓ Plan de mejora</span>
                                                            )}
                                                            {docFilename && (
                                                                <a 
                                                                    href={getDocumentUrl(docFilename)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={styles.historialDocumentLink}
                                                                >
                                                                    Ver documento
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Paginación del historial */}
                                        {totalPages > 1 && (
                                            <div style={styles.pagination}>
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    style={styles.paginationButton}
                                                >
                                                    Anterior
                                                </button>
                                                <span style={styles.paginationInfo}>
                                                    Página {currentPage} de {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    style={styles.paginationButton}
                                                >
                                                    Siguiente
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div style={styles.detailModalFooter}>
                            <button style={styles.closeButton} onClick={() => setShowDetailModal(false)}>
                                Cerrar
                            </button>
                            {!selectedStudent.planMejora && (
                                <button 
                                    style={styles.generatePlanButton}
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        openGenerarPlan(selectedStudent);
                                    }}
                                >
                                    Generar Plan de Mejora
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal para generar plan de mejora */}
            {showPlanModal && selectedStudent && (
                <div style={styles.modalOverlay} onClick={() => setShowPlanModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Generar Plan de Mejora</h3>
                            <button style={styles.modalClose} onClick={() => setShowPlanModal(false)}>×</button>
                        </div>
                        
                        <div style={styles.modalContent}>
                            <div style={styles.infoBox}>
                                <p><strong>Estudiante:</strong> {selectedStudent.estudiante}</p>
                                <p><strong>Curso:</strong> {selectedStudent.curso}</p>
                                <p><strong>Tipo:</strong> {selectedStudent.tipo}</p>
                                <p><strong>Nivel:</strong> {selectedStudent.nivel}</p>
                                <p><strong>Última observación:</strong> {selectedStudent.descripcion}</p>
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.modalLabel}>Plan de Mejora</label>
                                <textarea
                                    value={planMejora}
                                    onChange={(e) => setPlanMejora(e.target.value)}
                                    style={styles.textarea}
                                    rows="5"
                                    placeholder="Describa el plan de mejora para el estudiante..."
                                />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.modalLabel}>Documento (opcional)</label>
                                <div style={styles.fileInputContainer}>
                                    <input
                                        type="file"
                                        id="file-upload-plan"
                                        onChange={handleFileChange}
                                        style={styles.fileInput}
                                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                    />
                                    <label htmlFor="file-upload-plan" style={styles.fileInputLabel}>
                                        Seleccionar archivo
                                    </label>
                                    <span style={styles.fileName}>{nombreArchivo}</span>
                                </div>
                                <small style={styles.helpText}>
                                    Formatos permitidos: PDF, Word, TXT, JPG, PNG (máx. 5MB)
                                </small>
                            </div>
                        </div>
                        
                        <div style={styles.modalFooter}>
                            <button style={styles.cancelButton} onClick={() => setShowPlanModal(false)}>
                                Cancelar
                            </button>
                            <button style={styles.saveButton} onClick={handleGuardarPlan} disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Plan de Mejora'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1400px',
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
    errorContainer: {
        textAlign: 'center',
        padding: '50px'
    },
    retryButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '15px'
    },
    filtersContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    filterLabel: {
        fontWeight: '600',
        color: '#2c3e50',
        fontSize: '13px'
    },
    filterSelect: {
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    filterInput: {
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '6px',
        fontSize: '14px'
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
        fontSize: '14px',
        fontWeight: '600'
    },
    tr: {
        borderBottom: '1px solid #ecf0f1'
    },
    td: {
        padding: '12px 15px',
        fontSize: '14px',
        verticalAlign: 'top'
    },
    descripcionPreview: {
        fontSize: '11px',
        color: '#7f8c8d',
        display: 'block',
        marginTop: '4px'
    },
    badge: {
        backgroundColor: '#27ae60',
        color: 'white',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
    },
    tipoBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
    },
    nivelBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
    },
    actionButton: {
        padding: '6px 12px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        marginRight: '8px'
    },
    planButton: {
        padding: '6px 12px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    emptyMessage: {
        textAlign: 'center',
        padding: '60px',
        color: '#95a5a6'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    detailModal: {
        backgroundColor: 'white',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
    },
    detailModalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: '1px solid #ecf0f1',
        backgroundColor: '#27ae60',
        color: 'white'
    },
    detailModalTitle: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '600'
    },
    modalClose: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: 'white',
        opacity: 0.8
    },
    detailModalContent: {
        padding: '24px',
        overflowY: 'auto'
    },
    detailModalFooter: {
        padding: '16px 24px',
        borderTop: '1px solid #ecf0f1',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        backgroundColor: '#f8f9fa'
    },
    studentHeader: {
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px'
    },
    studentAvatar: {
        width: '60px',
        height: '60px',
        backgroundColor: '#27ae60',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        fontWeight: 'bold'
    },
    studentInfo: {
        flex: 1
    },
    studentName: {
        margin: '0 0 8px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    studentMeta: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },
    metaBadge: {
        fontSize: '12px',
        color: '#7f8c8d',
        backgroundColor: '#ecf0f1',
        padding: '4px 10px',
        borderRadius: '20px'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '24px'
    },
    infoCard: {
        display: 'flex',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        alignItems: 'center'
    },
    infoCardIcon: {
        fontSize: '24px'
    },
    infoCardContent: {
        flex: 1
    },
    infoCardLabel: {
        fontSize: '11px',
        color: '#7f8c8d',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '4px'
    },
    infoCardValue: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#2c3e50'
    },
    detailBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
    },
    descripcionSection: {
        marginBottom: '20px'
    },
    descripcionTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '8px',
        paddingBottom: '6px',
        borderBottom: '2px solid #27ae60'
    },
    descripcionContent: {
        fontSize: '14px',
        color: '#4a5568',
        lineHeight: '1.6',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    documentsSection: {
        marginBottom: '20px'
    },
    documentsTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '8px',
        paddingBottom: '6px',
        borderBottom: '2px solid #27ae60'
    },
    documentsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    documentItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        flexWrap: 'wrap'
    },
    documentIcon: {
        fontSize: '18px'
    },
    documentName: {
        fontSize: '13px',
        color: '#2c3e50',
        flex: 1
    },
    documentLink: {
        fontSize: '12px',
        color: '#27ae60',
        textDecoration: 'none',
        padding: '4px 12px',
        backgroundColor: '#e8f5e9',
        borderRadius: '4px'
    },
    documentDate: {
        fontSize: '11px',
        color: '#95a5a6'
    },
    noDocuments: {
        fontSize: '13px',
        color: '#95a5a6',
        padding: '12px',
        textAlign: 'center',
        fontStyle: 'italic'
    },
    planSection: {
        marginBottom: '20px'
    },
    planTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '8px',
        paddingBottom: '6px',
        borderBottom: '2px solid #27ae60'
    },
    planContent: {
        fontSize: '14px',
        color: '#4a5568',
        lineHeight: '1.6',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    noPlanText: {
        color: '#95a5a6',
        fontStyle: 'italic'
    },
    historialSection: {
        marginTop: '20px',
        borderTop: '1px solid #ecf0f1',
        paddingTop: '20px'
    },
    historialTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    historialCount: {
        fontSize: '12px',
        color: '#7f8c8d',
        fontWeight: 'normal'
    },
    historialList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '400px',
        overflowY: 'auto'
    },
    historialItem: {
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '3px solid #27ae60'
    },
    historialItemHeader: {
        display: 'flex',
        gap: '10px',
        marginBottom: '8px',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    historialItemDate: {
        fontSize: '12px',
        fontWeight: '500',
        color: '#2c3e50'
    },
    historialBadge: {
        padding: '2px 8px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '10px',
        fontWeight: '600'
    },
    historialItemDesc: {
        fontSize: '13px',
        color: '#4a5568',
        marginBottom: '8px',
        lineHeight: '1.5'
    },
    historialItemFooter: {
        display: 'flex',
        gap: '12px',
        fontSize: '11px',
        color: '#7f8c8d',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    hasPlanBadge: {
        backgroundColor: '#27ae60',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '10px'
    },
    historialDocumentLink: {
        color: '#3498db',
        textDecoration: 'none',
        fontSize: '11px'
    },
    historialLoading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        padding: '20px'
    },
    smallSpinner: {
        width: '20px',
        height: '20px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid #27ae60',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    noHistorial: {
        textAlign: 'center',
        color: '#95a5a6',
        padding: '20px',
        fontStyle: 'italic'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid #ecf0f1'
    },
    paginationButton: {
        padding: '6px 12px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    paginationInfo: {
        fontSize: '12px',
        color: '#2c3e50'
    },
    closeButton: {
        padding: '8px 20px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    generatePlanButton: {
        padding: '8px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '550px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #ecf0f1',
        backgroundColor: '#f8f9fa'
    },
    modalTitle: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    modalContent: {
        padding: '20px',
        overflowY: 'auto'
    },
    modalFooter: {
        padding: '16px 20px',
        borderTop: '1px solid #ecf0f1',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px'
    },
    infoBox: {
        backgroundColor: '#f8f9fa',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    modalLabel: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#2c3e50',
        fontSize: '14px'
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #dcdfe6',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box'
    },
    fileInputContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
    },
    fileInput: {
        display: 'none'
    },
    fileInputLabel: {
        padding: '10px 16px',
        backgroundColor: '#e2e8f0',
        color: '#2d3748',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer'
    },
    fileName: {
        fontSize: '13px',
        color: '#4a5568',
        fontStyle: 'italic'
    },
    helpText: {
        fontSize: '11px',
        color: '#7f8c8d',
        marginTop: '4px',
        display: 'block'
    },
    cancelButton: {
        padding: '8px 16px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    saveButton: {
        padding: '8px 16px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
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

export default DirectivoSeguimiento;
// Frontend/src/Pages/DocenteObservaciones.jsx
import { useState, useEffect } from 'react';

const DocenteObservaciones = ({ user }) => {
    const [cursos, setCursos] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState('');
    const [selectedEstudiante, setSelectedEstudiante] = useState('');
    const [tipo, setTipo] = useState('');
    const [nivel, setNivel] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [planMejora, setPlanMejora] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [nombreArchivo, setNombreArchivo] = useState('Ningún archivo seleccionado');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEstudiantes();
    }, [user]);

    const fetchEstudiantes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/students/docente/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const uniqueCursos = [...new Set(data.data.map(e => e.grado_especifico))];
            setCursos(uniqueCursos);
            setEstudiantes(data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('❌ El archivo no puede ser mayor a 5MB');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEstudiante || !tipo || !nivel || !descripcion) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('studentId', selectedEstudiante);
            formData.append('docenteId', user.id);
            formData.append('tipo', tipo);
            formData.append('nivel', nivel);
            formData.append('descripcion', descripcion);
            formData.append('planMejora', planMejora || '');
            if (archivo) formData.append('documento', archivo);

            const response = await fetch('http://localhost:5000/api/observations/with-file', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                alert('✅ Observación registrada exitosamente');
                setSelectedEstudiante('');
                setTipo('');
                setNivel('');
                setDescripcion('');
                setPlanMejora('');
                setArchivo(null);
                setNombreArchivo('Ningún archivo seleccionado');
                const fileInput = document.getElementById('file-upload');
                if (fileInput) fileInput.value = '';
            } else {
                const error = await response.json();
                alert(`❌ Error: ${error.message || 'No se pudo registrar la observación'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión con el servidor');
        }
    };

    const estudiantesFiltrados = selectedCurso ? estudiantes.filter(e => e.grado_especifico === selectedCurso) : [];

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Registro de Observaciones</h2>
            <p style={styles.pageSubtitle}>Registro observaciones académicas y disciplinarias</p>
            <div style={styles.formCard}>
                <h3 style={styles.formTitle}>Nueva Observación</h3>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Curso *</label>
                        <select style={styles.select} value={selectedCurso} onChange={(e) => { setSelectedCurso(e.target.value); setSelectedEstudiante(''); }} required>
                            <option value="">Seleccione un curso</option>
                            {cursos.map(curso => <option key={curso} value={curso}>{curso}</option>)}
                        </select>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Estudiante *</label>
                        <select style={styles.select} value={selectedEstudiante} onChange={(e) => setSelectedEstudiante(e.target.value)} required disabled={!selectedCurso}>
                            <option value="">Seleccione un estudiante</option>
                            {estudiantesFiltrados.map(e => <option key={e._id} value={e._id}>{e.apellido1 || e.apellido}</option>)}
                        </select>
                    </div>
                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tipo de Observación *</label>
                            <select style={styles.select} value={tipo} onChange={(e) => setTipo(e.target.value)} required>
                                <option value="">Seleccione el tipo</option>
                                <option value="Académica">📚 Académica</option>
                                <option value="Disciplinaria">⚠️ Disciplinaria</option>
                                <option value="General">📋 General</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tipo de Situación *</label>
                            <select style={styles.select} value={nivel} onChange={(e) => setNivel(e.target.value)} required>
                                <option value="">Seleccione el tipo</option>
                                <option value="Tipo I">🟢 Tipo I</option>
                                <option value="Tipo II">🟡 Tipo II</option>
                                <option value="Tipo III">🔴 Tipo III</option>
                            </select>
                            <small style={styles.helpText}>Según Manual de Convivencia (Cap. V, Arts. 27-29)</small>
                        </div>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Descripción de la Observación *</label>
                        <textarea style={styles.textarea} rows="6" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Describa detalladamente la observación..." required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Plan de Mejora (opcional)</label>
                        <textarea style={styles.textarea} rows="4" value={planMejora} onChange={(e) => setPlanMejora(e.target.value)} placeholder="Describa el plan de mejora para el estudiante..." />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Documento del Plan de Mejora (Opcional)</label>
                        <div style={styles.fileInputContainer}>
                            <input type="file" id="file-upload" onChange={handleFileChange} style={styles.fileInput} accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" />
                            <label htmlFor="file-upload" style={styles.fileInputLabel}>📎 Seleccionar archivo</label>
                            <span style={styles.fileName}>{nombreArchivo}</span>
                        </div>
                        <small style={styles.helpText}>Formatos permitidos: PDF, Word, TXT, JPG, PNG (máx. 5MB)</small>
                    </div>
                    <button type="submit" style={styles.submitButton}>Registrar Observación</button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '1000px', margin: '0 auto' },
    pageTitle: { margin: '0 0 8px 0', fontSize: '28px', color: '#2c3e50', fontWeight: '600' },
    pageSubtitle: { margin: '0 0 32px 0', fontSize: '16px', color: '#7f8c8d' },
    formCard: { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '32px' },
    formTitle: { margin: '0 0 28px 0', fontSize: '22px', color: '#2c3e50', fontWeight: '600', borderBottom: '3px solid #27ae60', paddingBottom: '12px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontWeight: '600', color: '#2c3e50', fontSize: '14px' },
    select: { width: '100%', padding: '12px', border: '1px solid #dcdfe6', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' },
    textarea: { width: '100%', padding: '12px', border: '1px solid #dcdfe6', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.5' },
    fileInputContainer: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
    fileInput: { display: 'none' },
    fileInputLabel: { padding: '10px 16px', backgroundColor: '#e2e8f0', color: '#2d3748', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
    fileName: { fontSize: '14px', color: '#4a5568', fontStyle: 'italic' },
    helpText: { fontSize: '12px', color: '#7f8c8d', marginTop: '4px' },
    submitButton: { marginTop: '8px', padding: '14px 24px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }
};

export default DocenteObservaciones;
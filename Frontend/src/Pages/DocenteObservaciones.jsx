// Frontend/src/Pages/DocenteObservaciones.jsx
import { useState, useEffect } from 'react';

const DocenteObservaciones = ({ user }) => {
    const [cursos, setCursos] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState('');
    const [selectedEstudiante, setSelectedEstudiante] = useState('');
    const [tipo, setTipo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [planMejora, setPlanMejora] = useState('');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/observations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: selectedEstudiante,
                    docenteId: user.id,
                    tipo,
                    descripcion,
                    nivel: 'Leve',
                    planMejora
                })
            });

            if (response.ok) {
                alert('Observación registrada exitosamente');
                setSelectedEstudiante('');
                setTipo('');
                setDescripcion('');
                setPlanMejora('');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const estudiantesFiltrados = selectedCurso 
        ? estudiantes.filter(e => e.grado_especifico === selectedCurso)
        : [];

    return (
        <div style={styles.container}>
            <h2 style={styles.pageTitle}>Registro de Observaciones</h2>
            <p style={styles.pageSubtitle}>Registro observaciones académicas y disciplinarias</p>

            <div style={styles.formCard}>
                <h3 style={styles.formTitle}>Nueva Observación</h3>
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    
                    {/* Curso */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Curso</label>
                        <select 
                            style={styles.select}
                            value={selectedCurso}
                            onChange={(e) => setSelectedCurso(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un curso</option>
                            {cursos.map(curso => (
                                <option key={curso} value={curso}>{curso}</option>
                            ))}
                        </select>
                    </div>

                    {/* Estudiante */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Estudiante</label>
                        <select 
                            style={styles.select}
                            value={selectedEstudiante}
                            onChange={(e) => setSelectedEstudiante(e.target.value)}
                            required
                            disabled={!selectedCurso}
                        >
                            <option value="">Seleccione un estudiante</option>
                            {estudiantesFiltrados.map(e => (
                                <option key={e._id} value={e._id}>
                                    {e.apellido1 || e.apellido}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tipo de Observación */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Tipo de Observación</label>
                        <select 
                            style={styles.select}
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            required
                        >
                            <option value="">Seleccione el tipo</option>
                            <option value="Académica">Académica</option>
                            <option value="Disciplinaria">Disciplinaria</option>
                            <option value="General">General</option>
                        </select>
                    </div>

                    {/* Descripción */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Descripción de la Observación</label>
                        <textarea
                            style={styles.textarea}
                            rows="8"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Describa detalladamente la observación..."
                            required
                        />
                    </div>

                    {/* Plan de Mejora */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Plan de Mejora</label>
                        <textarea
                            style={styles.textarea}
                            rows="6"
                            value={planMejora}
                            onChange={(e) => setPlanMejora(e.target.value)}
                            placeholder="Describa el plan de mejora para el estudiante..."
                        />
                    </div>

                    {/* Botón */}
                    <button type="submit" style={styles.submitButton}>
                        Registrar Observación
                    </button>

                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '900px',
        margin: '0 auto'
    },
    pageTitle: {
        margin: '0 0 8px 0',
        fontSize: '28px',
        color: '#2c3e50',
        fontWeight: '600'
    },
    pageSubtitle: {
        margin: '0 0 32px 0',
        fontSize: '16px',
        color: '#7f8c8d'
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        padding: '32px'
    },
    formTitle: {
        margin: '0 0 28px 0',
        fontSize: '22px',
        color: '#2c3e50',
        fontWeight: '600',
        borderBottom: '3px solid #27ae60',
        paddingBottom: '12px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontWeight: '600',
        color: '#2c3e50',
        fontSize: '15px'
    },
    select: {
        width: '100%',
        padding: '14px',
        border: '1px solid #dcdfe6',
        borderRadius: '10px',
        fontSize: '15px',
        backgroundColor: 'white',
        transition: 'all 0.3s',
        ':focus': {
            borderColor: '#27ae60',
            boxShadow: '0 0 0 3px rgba(39,174,96,0.1)',
            outline: 'none'
        }
    },
    textarea: {
        width: '100%',
        padding: '16px',
        border: '1px solid #dcdfe6',
        borderRadius: '10px',
        fontSize: '15px',
        fontFamily: 'inherit',
        resize: 'vertical',
        lineHeight: '1.6',
        transition: 'all 0.3s',
        ':focus': {
            borderColor: '#27ae60',
            boxShadow: '0 0 0 3px rgba(39,174,96,0.1)',
            outline: 'none'
        }
    },
    submitButton: {
        marginTop: '16px',
        padding: '16px 24px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '17px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s',
        ':hover': {
            backgroundColor: '#219a52',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(39,174,96,0.2)'
        }
    }
};

export default DocenteObservaciones;
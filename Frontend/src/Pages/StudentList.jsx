// Frontend/src/Pages/StudentList.jsx
import { useState } from 'react';

const StudentList = ({ students }) => {
    const [expanded, setExpanded] = useState(true);

    if (students.length === 0) {
        return (
            <div style={styles.emptyContainer}>
                <p>No hay estudiantes para mostrar</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.sectionHeader} onClick={() => setExpanded(!expanded)}>
                <h3 style={styles.sectionTitle}>
                    Listado de Estudiantes <span style={styles.count}>({students.length})</span>
                </h3>
                <span style={styles.expandIcon}>{expanded ? '▼' : '▶'}</span>
            </div>

            {expanded && (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>ID Estudiante</th>
                                <th style={styles.th}>Nombre Completo</th>
                                <th style={styles.th}>Grado</th>
                                <th style={styles.th}>Acudiente</th>
                                <th style={styles.th}>Teléfono</th>
                                <th style={styles.th}>Vereda</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student._id} style={styles.tr}>
                                    <td style={styles.td}>{student.id_estudiante}</td>
                                    <td style={styles.td}>
                                        <strong>{student.apellido}</strong>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.gradeBadge,
                                            backgroundColor: student.grado === 'preescolar' ? '#27ae60' :
                                                           student.grado === 'primaria' ? '#2980b9' : '#8e44ad'
                                        }}>
                                            {student.grado}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{student.nombre_acudiente || '-'}</td>
                                    <td style={styles.td}>{student.telefono || '-'}</td>
                                    <td style={styles.td}>{student.vereda || '-'}</td>
                                    <td style={styles.td}>
                                        <button 
                                            style={styles.actionButton}
                                            onClick={() => alert(`Ver detalles de ${student.apellido}`)}
                                            title="Ver detalles"
                                        >
                                            👁️
                                        </button>
                                        <button 
                                            style={styles.actionButton}
                                            onClick={() => alert(`Editar ${student.apellido}`)}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        marginBottom: '25px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
    },
    sectionHeader: {
        padding: '15px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #27ae60',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer'
    },
    sectionTitle: {
        margin: 0,
        color: '#2c3e50',
        fontSize: '16px'
    },
    count: {
        color: '#27ae60',
        fontWeight: 'normal',
        marginLeft: '5px'
    },
    expandIcon: {
        fontSize: '14px',
        color: '#7f8c8d'
    },
    emptyContainer: {
        padding: '40px',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '10px',
        color: '#95a5a6'
    },
    tableContainer: {
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    tableHeader: {
        backgroundColor: '#f8f9fa'
    },
    th: {
        padding: '12px 15px',
        textAlign: 'left',
        color: '#2c3e50',
        fontSize: '13px',
        fontWeight: 'bold'
    },
    tr: {
        borderBottom: '1px solid #ecf0f1'
    },
    td: {
        padding: '12px 15px',
        fontSize: '13px'
    },
    gradeBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-block'
    },
    actionButton: {
        margin: '0 5px',
        padding: '5px 8px',
        border: 'none',
        borderRadius: '3px',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'transform 0.2s',
        ':hover': {
            transform: 'scale(1.1)'
        }
    }
};

export default StudentList;
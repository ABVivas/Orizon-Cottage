// Frontend/src/Pages/UserList.jsx
import { useState } from 'react';

const UserList = ({ users, title, rol, onUserUpdate }) => {
    const [expanded, setExpanded] = useState(true);

    const toggleStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/${userId}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ activo: !currentStatus })
            });
            const data = await response.json();
            if (data.success) {
                onUserUpdate();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const resetPassword = async (userId) => {
        if (!confirm('¿Generar nueva contraseña para este usuario?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                alert(`Nueva contraseña: ${data.tempPassword}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getAsignacionText = (user) => {
        if (user.rol === 'docente') {
            return user.cursosAsignados?.join(', ') || 'Sin asignar';
        }
        if (user.rol === 'acudiente') {
            return `${user.estudiantesAsociados?.length || 0} estudiante(s)`;
        }
        return '-';
    };

    if (users.length === 0) return null;

    return (
        <div style={styles.container}>
            <div style={styles.sectionHeader} onClick={() => setExpanded(!expanded)}>
                <h3 style={styles.sectionTitle}>
                    {title} <span style={styles.count}>({users.length})</span>
                </h3>
                <span style={styles.expandIcon}>{expanded ? '▼' : '▶'}</span>
            </div>

            {expanded && (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Nombre</th>
                                <th style={styles.th}>Identificación</th>
                                <th style={styles.th}>Asignación</th>
                                <th style={styles.th}>Estado</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div>
                                            <strong>{user.nombre}</strong>
                                            <br />
                                            <small style={styles.emailText}>{user.email || 'Sin email'}</small>
                                        </div>
                                    </td>
                                    <td style={styles.td}>{user.numeroIdentificacion}</td>
                                    <td style={styles.td}>
                                        <small>{getAsignacionText(user)}</small>
                                    </td>
                                    <td style={styles.td}>
                                        <span className={`status-badge ${user.activo ? 'status-active' : 'status-inactive'}`}>
                                            {user.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            style={styles.actionButton}
                                            onClick={() => toggleStatus(user._id, user.activo)}
                                            title={user.activo ? 'Desactivar' : 'Activar'}
                                        >
                                            {user.activo ? '🔒' : '🔓'}
                                        </button>
                                        <button 
                                            style={styles.actionButton}
                                            onClick={() => resetPassword(user._id)}
                                            title="Resetear contraseña"
                                        >
                                            🔑
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
    emailText: {
        color: '#7f8c8d',
        fontSize: '11px'
    },
    actionButton: {
        margin: '0 5px',
        padding: '5px 8px',
        border: 'none',
        borderRadius: '3px',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '16px'
    }
};

export default UserList;
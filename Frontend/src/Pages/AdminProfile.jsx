// Frontend/src/Pages/AdminProfile.jsx
import { useState, useEffect } from 'react';

const AdminProfile = ({ user }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', telefono: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setProfile(data.user);
                setFormData({ 
                    nombre: data.user.nombre, 
                    telefono: data.user.telefono || '' 
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                setProfile(data.user);
                setEditing(false);
                // Actualizar el usuario en localStorage
                const savedUser = JSON.parse(localStorage.getItem('user'));
                savedUser.nombre = formData.nombre;
                localStorage.setItem('user', JSON.stringify(savedUser));
                alert('✅ Perfil actualizado correctamente');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error al actualizar perfil');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div style={styles.loading}>Cargando perfil...</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Mi Perfil</h2>
            <p style={styles.subtitle}>Información de tu cuenta de administrador</p>

            {!editing ? (
                <div style={styles.profileCard}>
                    <div style={styles.avatarSection}>
                        <div style={styles.avatar}>👤</div>
                        <h3 style={styles.profileName}>{profile?.nombre}</h3>
                        <p style={styles.profileRole}>Administrador del Sistema</p>
                    </div>

                    <div style={styles.infoSection}>
                        <div style={styles.infoGroup}>
                            <label style={styles.infoLabel}>Número de Identificación</label>
                            <p style={styles.infoValue}>{profile?.numeroIdentificacion}</p>
                        </div>

                        <div style={styles.infoGroup}>
                            <label style={styles.infoLabel}>Teléfono</label>
                            <p style={styles.infoValue}>{profile?.telefono || 'No registrado'}</p>
                        </div>

                        <div style={styles.infoGroup}>
                            <label style={styles.infoLabel}>Rol</label>
                            <p style={styles.infoValue}>
                                <span style={styles.roleBadge}>Administrador</span>
                            </p>
                        </div>

                        <div style={styles.infoGroup}>
                            <label style={styles.infoLabel}>Último acceso</label>
                            <p style={styles.infoValue}>{formatDate(profile?.ultimoAcceso)}</p>
                        </div>

                        <button onClick={() => setEditing(true)} style={styles.editButton}>
                            ✏️ Editar Perfil
                        </button>
                    </div>
                </div>
            ) : (
                <div style={styles.editCard}>
                    <h3 style={styles.editTitle}>Editar Perfil</h3>
                    <form onSubmit={handleUpdate} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Nombre Completo *</label>
                            <input 
                                type="text" 
                                value={formData.nombre} 
                                onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                                required 
                                style={styles.formInput} 
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Teléfono</label>
                            <input 
                                type="tel" 
                                value={formData.telefono} 
                                onChange={(e) => setFormData({...formData, telefono: e.target.value})} 
                                placeholder="Ej: 3001234567"
                                style={styles.formInput} 
                            />
                            <small style={styles.helpText}>Opcional - Número de contacto</small>
                        </div>

                        <div style={styles.formButtons}>
                            <button type="button" style={styles.cancelButton} onClick={() => setEditing(false)}>
                                Cancelar
                            </button>
                            <button type="submit" style={styles.saveButton}>
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto'
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        color: '#7f8c8d'
    },
    title: {
        color: '#2c3e50',
        marginBottom: '5px',
        fontSize: '28px',
        fontWeight: '600'
    },
    subtitle: {
        color: '#7f8c8d',
        marginBottom: '30px',
        fontSize: '14px'
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden'
    },
    avatarSection: {
        backgroundColor: '#27ae60',
        color: 'white',
        padding: '30px',
        textAlign: 'center'
    },
    avatar: {
        fontSize: '60px',
        marginBottom: '10px'
    },
    profileName: {
        margin: '10px 0 5px',
        fontSize: '22px',
        fontWeight: '600'
    },
    profileRole: {
        margin: 0,
        fontSize: '14px',
        opacity: 0.9
    },
    infoSection: {
        padding: '25px'
    },
    infoGroup: {
        marginBottom: '15px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    infoLabel: {
        display: 'block',
        fontSize: '12px',
        color: '#7f8c8d',
        marginBottom: '5px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    infoValue: {
        margin: 0,
        fontSize: '16px',
        color: '#2c3e50',
        fontWeight: '500'
    },
    roleBadge: {
        display: 'inline-block',
        padding: '4px 12px',
        backgroundColor: '#27ae60',
        color: 'white',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
    },
    editButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        marginTop: '20px',
        transition: 'background-color 0.2s'
    },
    editCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '25px'
    },
    editTitle: {
        margin: '0 0 20px 0',
        color: '#2c3e50',
        fontSize: '20px',
        fontWeight: '600',
        borderBottom: '2px solid #27ae60',
        paddingBottom: '10px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    formLabel: {
        fontWeight: '600',
        color: '#2c3e50',
        fontSize: '14px'
    },
    formInput: {
        padding: '12px',
        border: '1px solid #dcdfe6',
        borderRadius: '8px',
        fontSize: '14px',
        transition: 'border-color 0.2s'
    },
    helpText: {
        fontSize: '11px',
        color: '#7f8c8d',
        marginTop: '4px'
    },
    formButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '10px'
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    saveButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    }
};

export default AdminProfile;
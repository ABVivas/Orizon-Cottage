// Frontend/src/Pages/AdminProfile.jsx
import { useState, useEffect } from 'react';

const AdminProfile = ({ user }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        cargo: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setProfile(data.user);
                setFormData({
                    nombre: data.user.nombre,
                    email: data.user.email || '',
                    telefono: data.user.telefono || '',
                    cargo: data.user.cargo || 'Administrador'
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
                // Actualizar usuario en localStorage
                const savedUser = JSON.parse(localStorage.getItem('user'));
                savedUser.nombre = formData.nombre;
                localStorage.setItem('user', JSON.stringify(savedUser));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (loading) return <p>Cargando perfil...</p>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Mi Perfil</h2>

            {!editing ? (
                <div style={styles.profileCard}>
                    <div style={styles.avatarSection}>
                        <div style={styles.avatar}>👤</div>
                        <h3 style={styles.profileName}>{profile?.nombre}</h3>
                        <p style={styles.profileRole}>{profile?.cargo || 'Administrador'}</p>
                    </div>

                    <div style={styles.infoSection}>
                        <div style={styles.infoGroup}>
                            <label style={styles.infoLabel}>Número de Identificación</label>
                            <p style={styles.infoValue}>{profile?.numeroIdentificacion}</p>
                        </div>
                        <div style={styles.infoGroup}>
                            <label style={styles.infoLabel}>Email</label>
                            <p style={styles.infoValue}>{profile?.email || 'No registrado'}</p>
                        </div>
                        <div style={styles.infoGroup}>
                            <label style={styles.infoLabel}>Teléfono</label>
                            <p style={styles.infoValue}>{profile?.telefono || 'No registrado'}</p>
                        </div>
                        <div style={styles.infoGroup}>
                            <label style={styles.infoLabel}>Rol</label>
                            <p style={styles.infoValue}>{profile?.rol}</p>
                        </div>
                        <div style={styles.infoGroup}>
                            <label style={styles.infoLabel}>Último acceso</label>
                            <p style={styles.infoValue}>
                                {profile?.ultimoAcceso ? new Date(profile.ultimoAcceso).toLocaleString() : 'No disponible'}
                            </p>
                        </div>

                        <button 
                            onClick={() => setEditing(true)}
                            style={styles.editButton}
                        >
                            ✏️ Editar Perfil
                        </button>
                    </div>
                </div>
            ) : (
                <div style={styles.editCard}>
                    <h3 style={styles.editTitle}>Editar Perfil</h3>
                    <form onSubmit={handleUpdate} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Nombre Completo</label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                required
                                style={styles.formInput}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                style={styles.formInput}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Teléfono</label>
                            <input
                                type="text"
                                value={formData.telefono}
                                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                style={styles.formInput}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Cargo</label>
                            <input
                                type="text"
                                value={formData.cargo}
                                onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                                style={styles.formInput}
                            />
                        </div>

                        <div style={styles.formButtons}>
                            <button 
                                type="button" 
                                style={styles.cancelButton}
                                onClick={() => setEditing(false)}
                            >
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
    title: {
        color: '#2c3e50',
        marginBottom: '30px',
        fontSize: '22px'
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
    },
    avatarSection: {
        backgroundColor: '#27ae60',
        color: 'white',
        padding: '40px',
        textAlign: 'center'
    },
    avatar: {
        fontSize: '80px',
        marginBottom: '10px'
    },
    profileName: {
        margin: '10px 0 5px',
        fontSize: '24px'
    },
    profileRole: {
        margin: 0,
        fontSize: '16px',
        opacity: 0.9
    },
    infoSection: {
        padding: '30px'
    },
    infoGroup: {
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px'
    },
    infoLabel: {
        display: 'block',
        fontSize: '12px',
        color: '#7f8c8d',
        marginBottom: '5px'
    },
    infoValue: {
        margin: 0,
        fontSize: '16px',
        color: '#2c3e50',
        fontWeight: '500'
    },
    editButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '20px'
    },
    editCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '30px'
    },
    editTitle: {
        margin: '0 0 20px 0',
        color: '#2c3e50'
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
        fontWeight: 'bold',
        color: '#2c3e50',
        fontSize: '14px'
    },
    formInput: {
        padding: '10px',
        border: '1px solid #bdc3c7',
        borderRadius: '5px',
        fontSize: '14px'
    },
    formButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '20px'
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    saveButton: {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    }
};

export default AdminProfile;
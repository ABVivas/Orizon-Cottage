// Frontend/src/App.jsx
import { useState, useEffect } from 'react';

function App() {
  const [apiUrl] = useState('http://localhost:5000/api');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('todos');

const formatName = (name) => {
  if (!name || name === 'N/A') return 'N/A';
  
  // Si el nombre está en mayúsculas, lo formateamos correctamente
  if (name === name.toUpperCase()) {
    return name.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Si ya tiene formato, lo devolvemos como está
  return name;
};

  // Función para probar la conexión con el backend
  async function testConnection() {
    setError('');
    setMessage('Probando conexión...');
    
    try {
      console.log('Intentando conectar a:', `${apiUrl}/test`);
      const response = await fetch(`${apiUrl}/test`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      setMessage(`✅ Conexión exitosa: ${data.message}`);
    } catch (error) {
      console.error('❌ Error detallado:', error);
      setError(`❌ Error: ${error.message}`);
      setMessage('');
    }
  }

  // Función para obtener todos los estudiantes
  async function getStudents() {
    setError('');
    setLoading(true);
    
    try {
      console.log('Obteniendo estudiantes de:', `${apiUrl}/students`);
      const response = await fetch(`${apiUrl}/students`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Estudiantes recibidos:', data);
      
      if (data.success) {
        setStudents(data.data);
        setMessage(`✅ ${data.count} estudiantes cargados`);
      } else {
        setError('❌ Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('❌ Error al obtener estudiantes:', error);
      setError(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Función para obtener estudiantes por grado
  async function getStudentsByGrade(grade) {
    setError('');
    setLoading(true);
    setSelectedGrade(grade);
    
    try {
      const url = grade === 'todos' 
        ? `${apiUrl}/students`
        : `${apiUrl}/students/grade/${grade}`;
      
      console.log('Obteniendo estudiantes de:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Estudiantes recibidos:', data);
      
      if (data.success) {
        setStudents(data.data);
        setMessage(`✅ ${data.count} estudiantes ${grade !== 'todos' ? 'de ' + grade : ''}`);
      }
    } catch (error) {
      console.error('❌ Error al filtrar por grado:', error);
      setError(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Cargar datos al iniciar
  useEffect(() => {
    testConnection();
    getStudents();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#2c3e50' }}>🏫 Orizon Cottage - Sistema de Gestión Escolar</h1>
      
      {/* Mensajes de estado */}
      {message && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          {error}
        </div>
      )}

      {/* Botones de control */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testConnection}
          style={buttonStyle}
        >
          🔌 Probar Conexión
        </button>
        
        <button 
          onClick={() => getStudentsByGrade('todos')}
          style={{...buttonStyle, backgroundColor: selectedGrade === 'todos' ? '#4CAF50' : '#e7e7e7'}}
        >
          📋 Todos los Estudiantes
        </button>

        <button 
          onClick={() => getStudentsByGrade('preescolar')}
          style={{...buttonStyle, backgroundColor: selectedGrade === 'preescolar' ? '#4CAF50' : '#e7e7e7'}}
        >
          🏫 Preescolar
        </button>

        <button 
          onClick={() => getStudentsByGrade('primaria')}
          style={{...buttonStyle, backgroundColor: selectedGrade === 'primaria' ? '#4CAF50' : '#e7e7e7'}}
        >
          📚 Primaria
        </button>

        <button 
          onClick={() => getStudentsByGrade('secundaria')}
          style={{...buttonStyle, backgroundColor: selectedGrade === 'secundaria' ? '#4CAF50' : '#e7e7e7'}}
        >
          🎓 Secundaria
        </button>
      </div>

      {/* Tabla de estudiantes */}
      <h2>📊 Listado de Estudiantes ({students.length})</h2>
      
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                <th style={tableHeaderStyle}>No.</th>
                <th style={tableHeaderStyle}>Nombre Completo</th>
                <th style={tableHeaderStyle}>Grado</th>
                <th style={tableHeaderStyle}>ID Estudiante</th>
                <th style={tableHeaderStyle}>Acudiente</th>
                <th style={tableHeaderStyle}>Teléfono</th>
                <th style={tableHeaderStyle}>Vereda</th>
                <th style={tableHeaderStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={student._id || index} style={{ 
                    borderBottom: '1px solid #ddd',
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                  }}>
                    <td style={tableCellStyle}>{student.No || index + 1}</td>
                    <td style={tableCellStyle}>
                      {console.log('Dato del estudiante:', student.apellido1)}
                      <strong>{formatName(student.apellido1) || 'N/A'}</strong>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        backgroundColor: student.grado === 'preescolar' ? '#FFD700' : 
                                      student.grado === 'primaria' ? '#87CEEB' : '#98FB98',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        fontSize: '0.9em'
                      }}>
                        {student.grado || 'N/A'}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{student.id_estudiante || 'N/A'}</td>
                    <td style={tableCellStyle}>{formatName(student.nombre_acudiente) || 'N/A'}</td>
                    <td style={tableCellStyle}>{student.telefono || 'N/A'}</td>
                    <td style={tableCellStyle}>{student.vereda || 'N/A'}</td>
                    <td style={tableCellStyle}>
                      <button style={actionButtonStyle}>👁️ Ver</button>
                      <button style={actionButtonStyle}>✏️ Editar</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    {error ? 'Error al cargar datos' : 'No hay estudiantes para mostrar'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Estilos
const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd'
};

const tableCellStyle = {
  padding: '10px',
  textAlign: 'left'
};

const buttonStyle = {
  margin: '0 5px',
  padding: '8px 15px',
  cursor: 'pointer',
  border: 'none',
  borderRadius: '3px',
  backgroundColor: '#e7e7e7'
};

const actionButtonStyle = {
  margin: '0 5px',
  padding: '5px 10px',
  cursor: 'pointer',
  border: 'none',
  borderRadius: '3px',
  backgroundColor: '#e7e7e7'
};

export default App;
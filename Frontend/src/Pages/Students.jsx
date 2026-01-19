import { useEffect, useState } from "react";
import { getStudents, createStudent } from "../Services/student.service";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: "",
    nombre: "",
    apellido: "",
    grado: "",
    acudienteId: "",
  });
  const [error, setError] = useState("");

  // Cargar estudiantes
  const loadStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError("Error al cargar estudiantes");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Manejar inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createStudent(formData);
      setFormData({
        studentId: "",
        nombre: "",
        apellido: "",
        grado: "",
        acudienteId: "",
      });
      loadStudents();
    } catch (err) {
      setError("No se pudo registrar el estudiante");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Estudiantes</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="studentId" placeholder="ID" value={formData.studentId} onChange={handleChange} />
        <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} />
        <input name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} />
        <input name="grado" placeholder="Grado" value={formData.grado} onChange={handleChange} />
        <input name="acudienteId" placeholder="Acudiente ID" value={formData.acudienteId} onChange={handleChange} />
        <button type="submit">Registrar</button>
      </form>

      <hr />

      <h2>Listado de Estudiantes</h2>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Grado</th>
            <th>Acudiente</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.studentId}</td>
              <td>{s.nombre}</td>
              <td>{s.apellido}</td>
              <td>{s.grado}</td>
              <td>{s.acudienteId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Students;

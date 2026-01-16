// src/Pages/Students.jsx

import { useEffect, useState } from "react";
import { getStudents, createStudent } from "../Services/student.service";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: "",
    nombre: "",
    apellido: "",
    grado: "",
    acudienteId: ""
  });
  const [error, setError] = useState("");

  // Cargar estudiantes al iniciar
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError("Error al cargar estudiantes");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
        acudienteId: ""
      });
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar estudiante");
    }
  };

  return (
    <div>
      <h1>Gestión de Estudiantes</h1>

      <form onSubmit={handleSubmit}>
        <input name="studentId" placeholder="ID Estudiante" value={formData.studentId} onChange={handleChange} />
        <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} />
        <input name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} />
        <input name="grado" placeholder="Grado" value={formData.grado} onChange={handleChange} />
        <input name="acudienteId" placeholder="ID Acudiente" value={formData.acudienteId} onChange={handleChange} />

        <button type="submit">Registrar</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Listado de Estudiantes</h2>
      <ul>
        {students.map((student) => (
          <li key={student._id}>
            {student.nombre} {student.apellido} - {student.grado}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Students;

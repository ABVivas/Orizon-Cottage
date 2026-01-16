// src/Components/Navbar.jsx
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <Link to="/">Inicio</Link> |{" "}
      <Link to="/students">Estudiantes</Link> |{" "}
      <Link to="/attendance">Asistencia</Link> |{" "}
      <Link to="/observations">Observaciones</Link> |{" "}
      <Link to="/messages">Mensajes</Link>
    </nav>
  );
};

export default Navbar;

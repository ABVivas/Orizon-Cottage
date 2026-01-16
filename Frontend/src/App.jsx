// src/App.jsx
import { Routes, Route } from "react-router-dom";

// Pages
import Home from "./Pages/Home";
import Students from "./Pages/Students";
import Attendance from "./Pages/Attendance";
import Observations from "./Pages/Observations";
import Messages from "./Pages/Messages";

// Components
import Navbar from "./Components/Navbar";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/students" element={<Students />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/observations" element={<Observations />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </>
  );
}

export default App;

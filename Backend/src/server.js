import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Config/db.js";

import studentRoutes from "./Routes/student.routes.js";
import attendanceRoutes from "./Routes/attendance.routes.js";
import observationRoutes from "./Routes/observation.routes.js";
import messageRoutes from "./Routes/message.routes.js";

dotenv.config();

// Conexión a la base de datos
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/observations", observationRoutes);
app.use("/api/messages", messageRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente 🚀");
});

// Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Servidor backend funcionando en http://localhost:${PORT}`);
});

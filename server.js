// -------------------------------
// IMPORTS
// -------------------------------
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Para encriptar contraseñas

// -------------------------------
// APP CONFIG
// -------------------------------
const app = express();
app.use(express.json());
app.use(cors());

// -------------------------------
// CONEXIÓN A MONGODB ATLAS
// -------------------------------
mongoose.connect(
  'mongodb+srv://admin:Tareas1234@tareascluster.rkqstk3.mongodb.net/todolist?retryWrites=true&w=majority'
).then(() => console.log("✅ Conectado a MongoDB Atlas"))
 .catch(err => console.log("❌ Error al conectar:", err));

// -------------------------------
// MODELO DE USUARIO
// -------------------------------
const usuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

// -------------------------------
// MODELO DE TAREA
// -------------------------------
const tareaSchema = new mongoose.Schema({
  descripcion: { type: String, required: true },
  completada: { type: Boolean, default: false },
  fecha_creacion: { type: Date, default: Date.now }
});

const Tarea = mongoose.model('Tarea', tareaSchema);

// -------------------------------
// RUTAS CRUD DE TAREAS
// -------------------------------

// Obtener todas las tareas
app.get('/tareas', async (req, res) => {
  try {
    const tareas = await Tarea.find();
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

// Crear tarea
app.post('/tareas', async (req, res) => {
  try {
    const nueva = new Tarea(req.body);
    await nueva.save();
    res.status(201).json({ mensaje: "Tarea creada" });
  } catch (error) {
    res.status(500).json({ error: "Error al crear tarea" });
  }
});

// Actualizar tarea
app.put('/tareas/:id', async (req, res) => {
  try {
    await Tarea.findByIdAndUpdate(req.params.id, req.body);
    res.json({ mensaje: "Tarea actualizada" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar" });
  }
});

// Eliminar tarea
app.delete('/tareas/:id', async (req, res) => {
  try {
    await Tarea.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Tarea eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// -------------------------------
// RUTA DE REGISTRO DE USUARIO
// -------------------------------
app.post('/registro', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe)
      return res.status(400).json({ error: "El usuario ya existe" });

    const hashed = await bcrypt.hash(password, 10);

    const nuevo = new Usuario({ email, password: hashed });
    await nuevo.save();

    res.status(201).json({ mensaje: "Usuario registrado" });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// -------------------------------
// RUTA DE LOGIN (CORREGIDA)
// -------------------------------
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const esCorrecta = await bcrypt.compare(password, usuario.password);
    if (!esCorrecta)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    return res.status(200).json({
      mensaje: "Login exitoso",
      email: usuario.email
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

// -------------------------------
// INICIAR SERVIDOR
// -------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor funcionando en puerto: ${PORT}`);
});

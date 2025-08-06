// server.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("✅ Backend de CazaOfertas operativo");
});

// Login temporal fijo (sin env vars)
app.post("/login", (req, res) => {
  console.log("📥 Se recibió una petición POST en /login");
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

// server.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { searchAmazonProducts } = require("./amazon");

const fetch = require("node-fetch");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("✅ Backend de CazaOfertas operativo");
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

// 🔍 Ruta de búsqueda de productos
app.post("/search", async (req, res) => {
  try {
    const filters = req.body;
    const results = await searchAmazonProducts(filters);
    res.json(results);
  } catch (error) {
    console.error("Error en /search:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

// Auto-ping para evitar que Render duerma el servidor (cada 5 minutos)
setInterval(() => {
  fetch("https://cazaofertas-backend.onrender.com/")
    .then(res => res.text())
    .then(text => console.log("📡 Auto-ping exitoso:", text))
    .catch(err => console.error("⚠️ Error en auto-ping:", err.message));
}, 1000 * 60 * 5); // cada 5 minutos
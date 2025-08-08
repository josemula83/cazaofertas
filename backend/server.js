// server.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { searchAmazonProducts } = require("./amazon");
const db = require("./db");

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

// Buscar productos (simulado o real)
app.post("/search", async (req, res) => {
  try {
    const filters = req.body;
    const results = await searchAmazonProducts(filters);
    res.json(results);
  } catch (error) {
    console.error("❌ Error en /search:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Guardar enlace
app.post("/save-link", (req, res) => {
  const { title, url, category, discount, asin, price } = req.body;
  if (!title || !url || !category || asin === undefined || price === undefined) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  db.run(
    "INSERT INTO links (title, url, category, discount, asin, price) VALUES (?, ?, ?, ?, ?, ?)",
    [title, url, category, discount, asin, price],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Obtener enlaces públicos
app.get("/public-links", (req, res) => {
  db.all("SELECT * FROM links ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ⏰ Auto-ping para mantener activo el servidor Render
setInterval(() => {
  fetch("https://cazaofertas-backend.onrender.com/")
    .then(res => res.text())
    .then(text => console.log("📡 Auto-ping exitoso:", text))
    .catch(err => console.error("⚠️ Error en auto-ping:", err.message));
}, 1000 * 60 * 5); // cada 5 minutos

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

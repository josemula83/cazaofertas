const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const db = require("./db");

dotenv.config();
const app = express();

const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// 🟢 Ruta principal
app.get("/", (req, res) => {
  res.send("Servidor de CazaOfertas activo.");
});

// 🔐 Login básico
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

// 💾 Guardar nuevo producto
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

// 📥 Obtener todos los enlaces para administración
app.get("/admin-links", (req, res) => {
  db.all("SELECT * FROM links ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ❌ Eliminar producto
app.delete("/delete-link/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM links WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 🔁 Auto-ping para mantener Render activo (sin usar node-fetch)
setInterval(() => {
  fetch("https://cazaofertas.onrender.com")
    .then((res) => res.text())
    .then(() => console.log("📡 Auto-ping exitoso"))
    .catch((err) => console.error("Auto-ping falló:", err));
}, 5 * 60 * 1000);

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const db = require("./db");
const amazon = require("./amazon");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// 🔐 Login simple para panel de administrador
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

// 🔍 Buscar productos desde Amazon API (simulado o real)
app.post("/search", async (req, res) => {
  try {
    const { keyword, category, discount, primeOnly } = req.body;
    const results = await amazon.searchProducts(keyword, category, discount, primeOnly);
    res.json(results);
  } catch (error) {
    console.error("Error al buscar en Amazon API:", error.message);
    res.status(500).json({ error: "Error al buscar en Amazon API" });
  }
});

// 💾 Guardar enlace (desde búsqueda o manual)
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

// 🔎 Cargar productos públicos (visibles en la web)
app.get("/public-links", (req, res) => {
  db.all("SELECT * FROM links", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 🔐 Cargar productos para panel de administración
app.get("/admin-links", (req, res) => {
  db.all("SELECT * FROM links ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 🗑 Eliminar producto
app.delete("/delete-link/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM links WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 📡 Auto-ping (para mantener vivo el servidor en Render)
const fetch = require("node-fetch");
setInterval(() => {
  fetch("https://cazaofertas.onrender.com")
    .then((res) => res.text())
    .then(() => console.log("📡 Auto-ping exitoso"))
    .catch((err) => console.error("❌ Auto-ping falló", err));
}, 5 * 60 * 1000); // cada 5 minutos

// 🚀 Arranque del servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

// server.js – Reemplazo completo con endpoint /categories y /public-links
// Lista para usar en Render/local. Minimal, claro y extensible.

const path = require("path");
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

// ────────────────────────────────────────────────────────────
// Configuración
// ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, "data.sqlite");
// Si quieres servir bajo prefijo (p. ej. "/api"), define API_BASE="/api"
const API_BASE = process.env.API_BASE || ""; 

const app = express();
app.use(cors());
app.use(express.json());

// ────────────────────────────────────────────────────────────
// Base de datos
// ────────────────────────────────────────────────────────────
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error("[DB] Error abriendo base de datos:", err.message);
  } else {
    console.log(`[DB] Conectado a ${DB_FILE}`);
  }
});

// Crea la tabla si no existe (ajusta columnas según tu modelo)
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      url TEXT,
      image TEXT,
      category TEXT,
      discount INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );
});

// ────────────────────────────────────────────────────────────
// Rutas
// ────────────────────────────────────────────────────────────

// Healthcheck
app.get(`${API_BASE}/healthz`, (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Endpoint público para listar links (usado por el frontend)
// GET /public-links  -> [{ id, title, url, image, category, discount, created_at }, ...]
app.get(`${API_BASE}/public-links`, (_req, res) => {
  const sql = `
    SELECT id, title, url, image, category, discount, created_at
    FROM links
    ORDER BY id DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// (Opcional) Crear un link rápidamente
// POST /links { title, url, image?, category?, discount? }
app.post(`${API_BASE}/links`, (req, res) => {
  const { title, url, image = null, category = null, discount = 0 } = req.body || {};
  if (!title || !url) {
    return res.status(400).json({ error: "'title' y 'url' son obligatorios" });
  }
  const sql = `INSERT INTO links (title, url, image, category, discount) VALUES (?, ?, ?, ?, ?)`;
  const params = [title, url, image, category, parseInt(discount || 0, 10)];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

// ────────────────────────────────────────────────────────────
// /categories (a partir de la tabla links) – para el desplegable
// ────────────────────────────────────────────────────────────
const createCategoriesRouter = require("./routes/categories");
app.use(API_BASE, createCategoriesRouter(db));

// ────────────────────────────────────────────────────────────
// Errores
// ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error("[Error]", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ────────────────────────────────────────────────────────────
// Arranque
// ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[HTTP] Escuchando en http://localhost:${PORT}${API_BASE}`);
});

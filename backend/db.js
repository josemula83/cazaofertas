// db.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Usa un fichero estable; en Render suele vivir en /opt/render/project/src
const DB_PATH = path.join(__dirname, "data.sqlite");
const db = new sqlite3.Database(DB_PATH);

// Crear tabla + migración segura para 'image'
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      category TEXT NOT NULL,
      discount INTEGER DEFAULT 0,
      asin TEXT DEFAULT 'manual',
      price REAL DEFAULT 0,
      image TEXT
    )`
  );

  // Migración defensiva: añade 'image' si falta
  db.all("PRAGMA table_info(links);", (err, rows) => {
    if (err) {
      console.error("PRAGMA error:", err.message);
      return;
    }
    const hasImage = rows?.some((r) => r.name === "image");
    if (!hasImage) {
      db.run("ALTER TABLE links ADD COLUMN image TEXT", (e) => {
        if (e) {
          console.error("Error añadiendo columna image:", e.message);
        } else {
          console.log("Migración OK: columna 'image' añadida");
        }
      });
    }
  });
});

module.exports = db;

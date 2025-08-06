require("dotenv").config();
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");
const { searchAmazonProducts, validateProducts } = require("./amazon");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Ruta raíz de prueba (verificación desde navegador)
app.get("/", (req, res) => {
  res.send("✅ Backend CazaOfertas operativo");
});



// Ruta básica de prueba
app.get("/", (req, res) => {
  res.send("✅ Backend CazaOfertas operativo");
});

// Ruta de login segura con variables de entorno
app.post("/login", (req, res) => {
  console.log("📥 Se recibió una petición POST en /login");
  console.log(">> Intento de login:", req.body);  // DEBUG
  const { username, password } = req.body;

  if (
 //   username === process.env.ADMIN_USER &&
      username === "admin"
 //   password === process.env.ADMIN_PASS
      password === "admin123"
  ) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

// Buscar productos en Amazon
app.post("/search", async (req, res) => {
  try {
    const results = await searchAmazonProducts(req.body);
    res.json(results);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error buscando productos" });
  }
});

// Guardar producto
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

// Obtener todos los enlaces públicos
app.get("/public-links", (req, res) => {
  db.all("SELECT * FROM links", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Validación de productos cada hora o bajo demanda
app.post("/validate-links", async (req, res) => {
  db.all("SELECT id, asin, price FROM links", [], async (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const asinList = rows.map((row) => row.asin);
    const validList = await validateProducts(asinList);

    const invalid = rows.filter((row) => {
      const valid = validList.find((v) => v.asin === row.asin);
      return !valid || valid.price !== row.price;
    });

    let removed = 0;
    invalid.forEach((row) => {
      db.run("DELETE FROM links WHERE id = ?", [row.id], (delErr) => {
        if (!delErr) removed++;
      });
    });

    setTimeout(() => res.json({ removed }), 500);
  });
});

// Validación automática cada hora
setInterval(() => {
  db.all("SELECT id, asin, price FROM links", [], async (err, rows) => {
    if (err) return console.error("Error en validación automática:", err.message);
    const asinList = rows.map((row) => row.asin);
    const validList = await validateProducts(asinList);

    const invalid = rows.filter((row) => {
      const valid = validList.find((v) => v.asin === row.asin);
      return !valid || valid.price !== row.price;
    });

    invalid.forEach((row) => {
      db.run("DELETE FROM links WHERE id = ?", [row.id], (delErr) => {
        if (!delErr) console.log(`❌ Eliminado: ID ${row.id}`);
      });
    });
  });
}, 1000 * 60 * 60); // Cada hora

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🚀 Servidor corriendo en puerto nuevo ${PORT}`);
}); 



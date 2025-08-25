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

// --- Rutas públicas y admin para enlaces ---
//app.get("/public-links", (req, res) => {
//  db.all(
//    "SELECT id, title, url, category, discount, price, image FROM links ORDER BY id DESC",
//    [],
//    (err, rows) => {
//      if (err) {
//        console.error("public-links error:", err.message);
//        return res.status(500).json({ error: err.message });
//      }
//      res.json(rows || []);
//    }
//  );
//});

// ========================
// /public-links paginado con filtros y orden
// GET /public-links?page=1&limit=12&category=zapatillas&minDiscount=20&sort=discount_desc|discount_asc
// ========================
app.get("/public-links", (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "12", 10)));
    const offset = (page - 1) * limit;

    const category = (req.query.category || "").toLowerCase().trim();
    const minDiscount = parseInt(req.query.minDiscount || "0", 10);

    // sort: discount_desc (default) | discount_asc
    const sort = (req.query.sort || "discount_desc").toLowerCase();
    let orderBy = "ORDER BY discount DESC, id DESC";
    if (sort === "discount_asc") orderBy = "ORDER BY discount ASC, id DESC";

    let where = "WHERE 1=1";
    const params = [];

    if (category) {
      where += " AND LOWER(category) LIKE ?";
      params.push(`%${category}%`);
    }
    if (!isNaN(minDiscount) && minDiscount > 0) {
      where += " AND discount >= ?";
      params.push(minDiscount);
    }

    const countSql = `SELECT COUNT(*) AS total FROM links ${where}`;
    db.get(countSql, params, (errCount, countRow) => {
      if (errCount) return res.status(500).json({ error: errCount.message });

      const total = countRow?.total || 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      const listSql = `
        SELECT id, title, url, category, discount, price, image
        FROM links
        ${where}
        ${orderBy}
        LIMIT ? OFFSET ?`;
      db.all(listSql, [...params, limit, offset], (errList, rows) => {
        if (errList) return res.status(500).json({ error: errList.message });

        res.json({
          success: true,
          page,
          limit,
          total,
          totalPages,
          data: rows,
        });
      });
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.get("/admin-links", (req, res) => {
  db.all(
    "SELECT id, title, url, category, discount, price, image FROM links ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) {
        console.error("admin-links error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows || []);
    }
  );
});

app.post("/save-link", (req, res) => {
  const {
    title,
    url,
    category,
    discount = 0,
    asin = "manual",
    price = 0,
    image = null,
  } = req.body;

  if (!title || !url || !category) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  db.run(
    "INSERT INTO links (title, url, category, discount, asin, price, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, url, category, discount, asin, price, image],
    (err) => {
      if (err) {
        console.error("save-link error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

app.delete("/delete-link/:id", (req, res) => {
  db.run("DELETE FROM links WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      console.error("delete-link error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: this.changes > 0 });
  });
});

// Health para evitar HTML por defecto
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "cazaofertas-backend" });
});


// ========================
// GET /categories  ->  ["electronics","hogar","manual", ...]
// ========================
app.get("/categories", (req, res) => {
  const sql = `
    SELECT DISTINCT TRIM(category) AS category
    FROM links
    WHERE category IS NOT NULL AND TRIM(category) <> ''
    ORDER BY LOWER(category) ASC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const cats = rows.map(r => r.category);
    res.json({ success: true, categories: cats });
  });
});



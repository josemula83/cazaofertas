// backend/routes/categories.js
const express = require("express");

/**
 * Crea un router que expone GET /categories devolviendo
 * ["Auriculares", "Monitores", ...] a partir de la tabla `links`.
 *
 * @param {import('sqlite3').Database} db
 */
module.exports = function createCategoriesRouter(db) {
  const router = express.Router();

  router.get("/categories", (_req, res) => {
    const sql = `
      SELECT DISTINCT TRIM(category) AS category
      FROM links
      WHERE category IS NOT NULL AND TRIM(category) <> ''
      ORDER BY category COLLATE NOCASE
    `;

    db.all(sql, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows.map(r => r.category));
    });
  });

  return router;
};
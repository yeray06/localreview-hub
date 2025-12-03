const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// Debe ser el mismo secreto que en auth.js
const JWT_SECRET = "localreviewhub_super_secreto";

/* ---------- Middleware para comprobar token ---------- */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado (falta token)" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload: { userId, businessId, iat, exp }
    req.user = payload;
    next();
  } catch (err) {
    console.error("Error verificando token:", err);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// Todas las rutas de abajo requieren token
router.use(requireAuth);

/* ============================================================
   GET /api/reviews
   Lista las reseñas del negocio del usuario logueado
   ============================================================ */
router.get("/", async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const result = await pool.query(
      `SELECT id,
              customer_name,
              rating,
              comment,
              TO_CHAR(created_at, 'YYYY-MM-DD') AS created_at,
              responded
       FROM reviews
       WHERE business_id = $1
       ORDER BY created_at DESC, id DESC`,
      [businessId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Error en GET /reviews:", err);
    return res.status(500).json({ error: "Error al obtener reseñas" });
  }
});

/* ============================================================
   POST /api/reviews
   Crea una nueva reseña para el negocio logueado
   body: { customer_name, rating, comment, responded? }
   ============================================================ */
router.post("/", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { customer_name, rating, comment, responded } = req.body;

    const ratingNumber = parseInt(rating, 10);

    if (!ratingNumber || ratingNumber < 1 || ratingNumber > 5) {
      return res.status(400).json({ error: "Puntuación debe estar entre 1 y 5" });
    }

    const result = await pool.query(
      `INSERT INTO reviews (business_id, customer_name, rating, comment, responded)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id,
                 customer_name,
                 rating,
                 comment,
                 TO_CHAR(created_at, 'YYYY-MM-DD') AS created_at,
                 responded`,
      [
        businessId,
        customer_name || null,
        ratingNumber,
        comment || null,
        responded === true,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error en POST /reviews:", err);
    return res.status(500).json({ error: "Error al crear reseña" });
  }
});

/* ============================================================
   PUT /api/reviews/:id
   Actualiza una reseña del negocio logueado
   body: { customer_name?, rating?, comment?, responded? }
   ============================================================ */
router.put("/:id", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const reviewId = parseInt(req.params.id, 10);
    const { customer_name, rating, comment, responded } = req.body;

    if (isNaN(reviewId)) {
      return res.status(400).json({ error: "ID de reseña inválido" });
    }

    let ratingNumber = null;
    if (rating !== undefined) {
      ratingNumber = parseInt(rating, 10);
      if (!ratingNumber || ratingNumber < 1 || ratingNumber > 5) {
        return res
          .status(400)
          .json({ error: "Puntuación debe estar entre 1 y 5" });
      }
    }

    const result = await pool.query(
      `UPDATE reviews
       SET customer_name = COALESCE($1, customer_name),
           rating        = COALESCE($2, rating),
           comment       = COALESCE($3, comment),
           responded     = COALESCE($4, responded)
       WHERE id = $5 AND business_id = $6
       RETURNING id,
                 customer_name,
                 rating,
                 comment,
                 TO_CHAR(created_at, 'YYYY-MM-DD') AS created_at,
                 responded`,
      [
        customer_name || null,
        ratingNumber,
        comment || null,
        responded,
        reviewId,
        businessId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Reseña no encontrada" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en PUT /reviews/:id:", err);
    return res.status(500).json({ error: "Error al actualizar reseña" });
  }
});

/* ============================================================
   DELETE /api/reviews/:id
   Borra una reseña del negocio logueado
   ============================================================ */
router.delete("/:id", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const reviewId = parseInt(req.params.id, 10);

    if (isNaN(reviewId)) {
      return res.status(400).json({ error: "ID de reseña inválido" });
    }

    const result = await pool.query(
      `DELETE FROM reviews
       WHERE id = $1 AND business_id = $2`,
      [reviewId, businessId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Reseña no encontrada" });
    }

    return res.status(204).send(); // sin contenido
  } catch (err) {
    console.error("Error en DELETE /reviews/:id:", err);
    return res.status(500).json({ error: "Error al eliminar reseña" });
  }
});

module.exports = router;

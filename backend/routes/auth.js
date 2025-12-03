const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// Clave para firmar tokens (en un proyecto real iría en variables de entorno)
const JWT_SECRET = "localreviewhub_super_secreto";

/**
 * POST /api/auth/register
 * Crea un nuevo usuario + negocio
 * Espera en el body:
 * {
 *   name,
 *   email,
 *   password,
 *   business_name,
 *   business_category,
 *   business_address
 * }
 */
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      business_name,
      business_category,
      business_address,
    } = req.body;

    if (!name || !email || !password || !business_name) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // ¿Existe ya ese email?
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Creamos usuario + negocio en una transacción
    await pool.query("BEGIN");

    const userResult = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );

    const user = userResult.rows[0];

    const businessResult = await pool.query(
      `INSERT INTO businesses (user_id, name, category, address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, category, address`,
      [user.id, business_name, business_category || null, business_address || null]
    );

    const business = businessResult.rows[0];

    await pool.query("COMMIT");

    // Crear token
    const token = jwt.sign(
      {
        userId: user.id,
        businessId: business.id,
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      token,
      user,
      business,
    });
  } catch (err) {
    console.error("Error en /register:", err);
    await pool.query("ROLLBACK");
    return res.status(500).json({ error: "Error interno en el registro" });
  }
});

/**
 * POST /api/auth/login
 * Inicia sesión
 * Espera en el body:
 * {
 *   email,
 *   password
 * }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos" });
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.password_hash,
              b.id AS business_id, b.name AS business_name
       FROM users u
       JOIN businesses b ON b.user_id = u.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const row = result.rows[0];

    const passwordOk = await bcrypt.compare(password, row.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      {
        userId: row.id,
        businessId: row.business_id,
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login correcto",
      token,
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
      },
      business: {
        id: row.business_id,
        name: row.business_name,
      },
    });
  } catch (err) {
    console.error("Error en /login:", err);
    return res.status(500).json({ error: "Error interno en el login" });
  }
});

module.exports = router;

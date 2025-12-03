const { Pool } = require("pg");

// CONEXIÓN A TU POSTGRES DE DOCKER
const pool = new Pool({
  user: "yeray",
  password: "yeray123",
  host: "localhost",
  port: 5433,
  database: "localreviewhub",
});

pool.connect()
  .then(() => console.log("Conectado a PostgreSQL correctamente"))
  .catch((err) => console.error("Error de conexión:", err));

module.exports = pool;

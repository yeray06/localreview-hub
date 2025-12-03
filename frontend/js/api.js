/* ============================================================
   API.JS – CLIENTE DE LA API REAL (BACKEND)
   ============================================================ */

const API_BASE_URL = "http://localhost:4000/api";

/* ---------- Obtener token guardado por auth.js ---------- */
function getToken() {
  const raw = localStorage.getItem("lrh_auth");
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    return data.token || null;
  } catch {
    return null;
  }
}

/* ---------- Wrapper genérico con Authorization ---------- */
async function fetchWithAuth(path, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error("No hay token. Debes iniciar sesión.");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message = data.error || "Error en la API";
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

/* ============================================================
   FUNCIONES ESPECÍFICAS DE RESEÑAS
   ============================================================ */

/**
 * Obtener reseñas del negocio logueado
 * Opcional: filtrar por rating mínimo en frontend
 */
async function getReviews(minRating = 0) {
  const reviews = await fetchWithAuth("/reviews");

  if (minRating > 0) {
    return reviews.filter((r) => r.rating >= minRating);
  }

  return reviews;
}

/**
 * Crear una nueva reseña
 * review = { customer_name, rating, comment, responded }
 */
async function addReview(review) {
  const created = await fetchWithAuth("/reviews", {
    method: "POST",
    body: review,
  });
  return created;
}

/**
 * Actualizar una reseña
 * data puede contener: { customer_name, rating, comment, responded }
 */
async function updateReview(id, data) {
  const updated = await fetchWithAuth(`/reviews/${id}`, {
    method: "PUT",
    body: data,
  });
  return updated;
}

/**
 * Borrar reseña
 */
async function deleteReview(id) {
  await fetchWithAuth(`/reviews/${id}`, {
    method: "DELETE",
  });
}

/**
 * Calcular métricas a partir de las reseñas
 * (usa getReviews por dentro)
 */
async function getMetrics() {
  const reviews = await getReviews(0);

  if (!reviews.length) {
    return {
      total: 0,
      avg: 0,
      positive: 0,
    };
  }

  const total = reviews.length;
  const avg =
    Math.round(
      (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / total) * 10
    ) / 10;

  const positive = Math.round(
    (reviews.filter((r) => Number(r.rating) >= 4).length / total) * 100
  );

  return { total, avg, positive };
}

/* ============================================================
   EXPORTAR EN window.api PARA USARLO EN dashboard.js
   ============================================================ */

window.api = {
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  getMetrics,
};

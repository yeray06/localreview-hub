/* ============================================================
   DASHBOARD.JS – LÓGICA DEL PANEL CON API REAL
   ============================================================ */

// Elementos del DOM
const ratingFilter = document.getElementById("rating-filter");
const tableBody = document.querySelector(".reviews-table tbody");

const avgElement = document.querySelector(".metric-number.avg");
const totalElement = document.querySelector(".metric-number.total");
const positiveElement = document.querySelector(".metric-number.positive");

const btnNewReview = document.getElementById("btn-new-review");

/* ============================================================
   CARGAR MÉTRICAS DESDE LA API
   ============================================================ */
async function loadMetrics() {
  try {
    const metrics = await window.api.getMetrics();

    if (avgElement) {
      avgElement.textContent = `${metrics.avg} ★`;
    }
    if (totalElement) {
      totalElement.textContent = metrics.total;
    }
    if (positiveElement) {
      positiveElement.textContent = `${metrics.positive}%`;
    }
  } catch (err) {
    console.error("Error cargando métricas:", err);
    alert("Error al cargar las métricas de reseñas.");
  }
}

/* ============================================================
   RENDERIZAR TABLA DE RESEÑAS
   ============================================================ */
function renderReviews(reviews) {
  tableBody.innerHTML = "";

  if (!reviews.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:1rem;color:#9ca3af;">
          No hay reseñas registradas.
        </td>
      </tr>
    `;
    return;
  }

  reviews.forEach((r) => {
    const tr = document.createElement("tr");
    tr.dataset.id = r.id;

    tr.innerHTML = `
      <td>${r.customer_name || "-"}</td>
      <td>${r.rating} ★</td>
      <td>${r.comment || ""}</td>
      <td>${r.created_at || ""}</td>
      <td>
        <span class="badge ${
          r.responded ? "badge-success" : "badge-pending"
        }">
          ${r.responded ? "Respondida" : "Pendiente"}
        </span>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

/* ============================================================
   CARGAR RESEÑAS DESDE LA API
   ============================================================ */
async function loadReviews(minRating = 0) {
  try {
    const reviews = await window.api.getReviews(minRating);
    renderReviews(reviews);
  } catch (err) {
    console.error("Error cargando reseñas:", err);
    alert("Error al cargar las reseñas.");
  }
}

/* ============================================================
   MANEJAR CAMBIO DE FILTRO
   ============================================================ */
if (ratingFilter) {
  ratingFilter.addEventListener("change", async () => {
    const value = parseInt(ratingFilter.value, 10) || 0;
    await loadReviews(value);
  });
}

/* ============================================================
   AÑADIR NUEVA RESEÑA (de momento con prompts)
   ============================================================ */
if (btnNewReview) {
  btnNewReview.addEventListener("click", async () => {
    try {
      const customer_name = prompt("Nombre del cliente (opcional):");
      const ratingRaw = prompt("Puntuación (1 a 5):");

      const rating = parseInt(ratingRaw, 10);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        alert("La puntuación debe ser un número entre 1 y 5.");
        return;
      }

      const comment = prompt("Comentario (opcional):") || "";

      const newReview = {
        customer_name,
        rating,
        comment,
        responded: false,
      };

      await window.api.addReview(newReview);

      // Recargar métricas y tabla usando el filtro actual
      const currentFilter = parseInt(ratingFilter?.value || "0", 10) || 0;
      await loadMetrics();
      await loadReviews(currentFilter);

      alert("Reseña creada correctamente.");
    } catch (err) {
      console.error("Error al crear reseña:", err);
      alert(err.message || "Error al crear la reseña.");
    }
  });
}

/* ============================================================
   INICIALIZAR DASHBOARD
   ============================================================ */
(async function initDashboard() {
  // Por si se carga este JS fuera de dashboard.html, salimos
  if (!tableBody) return;

  try {
    await loadMetrics();
    const initialFilter = parseInt(ratingFilter?.value || "0", 10) || 0;
    await loadReviews(initialFilter);
  } catch (err) {
    console.error("Error inicializando el dashboard:", err);
  }
})();

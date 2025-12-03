/* ============================================================
   AUTH.JS – CONEXIÓN REAL CON BACKEND
   ============================================================ */

const API_BASE_URL = "http://localhost:4000/api";

// ---------- Gestión de token en localStorage ----------
function saveAuthData(data) {
  localStorage.setItem("lrh_auth", JSON.stringify(data));
}

function getAuthData() {
  const raw = localStorage.getItem("lrh_auth");
  return raw ? JSON.parse(raw) : null;
}

function clearAuthData() {
  localStorage.removeItem("lrh_auth");
}

// ---------- PROTEGER DASHBOARD ----------
if (window.location.pathname.endsWith("dashboard.html")) {
  const auth = getAuthData();
  if (!auth || !auth.token) {
    alert("Debes iniciar sesión primero.");
    window.location.href = "login.html";
  }
}

// ============================================================
// REGISTRO
// ============================================================

const registerForm = document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("user-name").value.trim();
    const email = document.getElementById("user-email").value.trim();
    const password = document.getElementById("user-password").value;
    const business_name = document.getElementById("business-name").value.trim();
    const business_category = document.getElementById("business-category").value.trim();
    const business_address = document.getElementById("business-address").value.trim();

    if (!name || !email || !password || !business_name) {
      alert("Rellena al menos nombre, email, contraseña y nombre del negocio.");
      return;
    }

    if (password.length < 4) {
      alert("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          business_name,
          business_category,
          business_address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al registrar la cuenta.");
        return;
      }

      // Guardamos token y datos básicos
      saveAuthData({
        token: data.token,
        user: data.user,
        business: data.business,
      });

      alert("Cuenta creada correctamente. Redirigiendo al panel...");
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("Error en registro:", err);
      alert("Error de conexión con el servidor.");
    }
  });
}

// ============================================================
// LOGIN
// ============================================================

const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
      alert("Introduce email y contraseña.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al iniciar sesión.");
        return;
      }

      saveAuthData({
        token: data.token,
        user: data.user,
        business: data.business,
      });

      alert("Inicio de sesión correcto. Redirigiendo al panel...");
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("Error en login:", err);
      alert("Error de conexión con el servidor.");
    }
  });
}

// ─── CONFIG ───────────────────────────────────────────────────────
const API_BASE = "/api";
const TOKEN_KEY = "admin_token";

// ─── LOGIN HANDLER ────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const button = document.querySelector(".btn-login");
  const errorMessage = document.getElementById("errorMessage");

  // Validation
  if (!username || !password) {
    showError("Please enter both username and password");
    return;
  }

  // Loading state
  button.disabled = true;
  button.classList.add("loading");
  errorMessage.classList.remove("show");

  try {
    const response = await fetch(API_BASE + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Store token
    localStorage.setItem(TOKEN_KEY, data.token);

    // Success
    errorMessage.classList.remove("show");
    button.textContent = "✓ Logging in...";

    // Redirect to admin dashboard
    setTimeout(() => {
      window.location.href = "/pages/admin.html";
    }, 500);
  } catch (err) {
    showError(err.message);
    button.disabled = false;
    button.classList.remove("loading");
  }
}

function showError(message) {
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.textContent = message;
  errorMessage.classList.add("show");
}

// ─── EVENT LISTENERS ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Check if already logged in
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    verifySession(token);
  }

  // Focus on username input
  document.getElementById("username").focus();

  // Enter key support
  document.getElementById("password").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  });
});

async function verifySession(token) {
  try {
    const response = await fetch(API_BASE + "/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (data.authenticated) {
      // Already logged in, redirect
      window.location.href = "/pages/admin.html";
    }
  } catch (err) {
    console.error("Session verification error:", err);
  }
}

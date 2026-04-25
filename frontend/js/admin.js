// ─── CONFIG ───────────────────────────────────────────────────────
const API_BASE = "/api";
const TOKEN_KEY = "admin_token";

// ─── STATE ────────────────────────────────────────────────────────
let products = [];
let filteredProducts = [];
let categories = [];
let currentEditId = null;
let pendingDeleteId = null;
let currentUsername = "";

// ─── API HELPERS ──────────────────────────────────────────────────
async function apiFetch(endpoint) {
  try {
    const res = await fetch(API_BASE + endpoint);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API fetch error:", err);
    showToast(err.message, "error");
    return null;
  }
}

async function apiPost(endpoint, body) {
  try {
    const res = await fetch(API_BASE + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API post error:", err);
    showToast(err.message, "error");
    return null;
  }
}

async function apiPut(endpoint, body) {
  try {
    const res = await fetch(API_BASE + endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API put error:", err);
    showToast(err.message, "error");
    return null;
  }
}

async function apiDelete(endpoint) {
  try {
    const res = await fetch(API_BASE + endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API delete error:", err);
    showToast(err.message, "error");
    return null;
  }
}

// ─── INITIALIZATION ───────────────────────────────────────────────
async function init() {
  // Check authentication first
  const authenticated = await verifyAuth();
  if (!authenticated) {
    return; // Redirect happens in verifyAuth
  }

  await loadCategories();
  await loadProducts();
  setupEventListeners();
}

async function verifyAuth() {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    window.location.href = "/pages/login.html";
    return false;
  }

  try {
    const response = await fetch(API_BASE + "/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!data.authenticated) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/pages/login.html";
      return false;
    }

    currentUsername = data.username;
    addLogoutButton();
    return true;
  } catch (err) {
    console.error("Auth verification error:", err);
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/pages/login.html";
    return false;
  }
}

function addLogoutButton() {
  const navLinks = document.querySelector(".nav-links");
  if (!navLinks) return;

  // Remove existing logout button if any
  const existingLogout = navLinks.querySelector(".logout-item");
  if (existingLogout) existingLogout.remove();

  // Add logout button
  const logoutItem = document.createElement("li");
  logoutItem.className = "logout-item";
  logoutItem.style.marginLeft = "auto";
  logoutItem.innerHTML = `
    <button class="logout-btn" onclick="handleLogout()">
      <span class="username">${currentUsername}</span>
      <span class="logout-text">Logout</span>
    </button> `;
  navLinks.appendChild(logoutItem);
}

function handleLogout() {
  const token = localStorage.getItem(TOKEN_KEY);

  fetch(API_BASE + "/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  }).finally(() => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/pages/login.html";
  });
}

// โหลด categories ลง select ทั้ง 2 อัน
async function loadCategories() {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();

    categories = data; // ✅ เพิ่มบรรทัดนี้

    const categorySelect = document.getElementById("productCategory");
    const filterSelect = document.getElementById("categoryFilter");

    if (!categorySelect || !filterSelect) {
      console.warn("Category select elements not found");
      return;
    }

    categorySelect.innerHTML = '<option value="">Select category...</option>';
    filterSelect.innerHTML = '<option value="">All Categories</option>';

    if (data && Array.isArray(data)) {
      data.forEach(cat => {
        categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        filterSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
      });
    } else {
      console.error("Categories data is not an array:", data);
    }

  } catch (err) {
    console.error("โหลด category ไม่ได้:", err);
    showToast("Failed to load categories", "error");
  }
}
// เรียกตอนเปิดหน้า
document.addEventListener("DOMContentLoaded", loadCategories);



async function loadProducts() {
  const data = await apiFetch("/products");
  if (data && data.products) {
    products = data.products;
    filteredProducts = [];
    renderProductsTable();
    updateStats(); 
  }
}

// ─── CATEGORY HELPERS ─────────────────────────────────────────────
function populateCategorySelects() {
  const formSelect = document.getElementById("productCategory");
  const filterSelect = document.getElementById("categoryFilter");

  // Populate form select
  const options = categories
    .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
    .join("");
  formSelect.innerHTML =
    '<option value="">Select category...</option>' + options;

  // Populate filter select
  const filterOptions = categories
    .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
    .join("");
  filterSelect.innerHTML =
    '<option value="">All Categories</option>' + filterOptions;
}

function getCategoryName(categoryId) {
  if (!categoryId) return "—";

  const cat = categories.find(
    (c) => c.id === Number(categoryId) // ✅ แปลงเป็น number
  );

  return cat ? cat.name : "—";
}

// ─── RENDER TABLE ────────────────────────────────────────────────
function renderProductsTable() {
  const tbody = document.getElementById("productsTableBody");
  const dataToRender = filteredProducts.length > 0 ? filteredProducts : products;

  if (dataToRender.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center">No products found</td></tr>';
    return;
  }

  tbody.innerHTML = dataToRender
    .map(
      (product) => `
    <tr>
      <td class="product-id">#${product.id}</td>
      <td>
        <strong>${product.name}</strong>
        <br>
        <span style="color: var(--text-secondary); font-size: 12px;">${product.description?.substring(0, 40) || "—"}...</span>
      </td>
      <td>${getCategoryName(product.category_id)}</td>
      <td>${product.brand || "—"}</td>
      <td class="product-price">฿${parseFloat(product.price).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
      <td class="product-stock ${product.stock > 10 ? "good" : product.stock > 0 ? "low" : "low"}">${product.stock}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="editProduct(${product.id})">Edit</button>
          <button class="btn-action btn-delete" onclick="openDeleteModal(${product.id}, '${product.name.replace(/'/g, "\\'")}')">Delete</button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");
}

// ─── STATISTICS ──────────────────────────────────────────────────
function updateStats() {
  const dataToUse = filteredProducts.length > 0 ? filteredProducts : products;
  const total = dataToUse.length;
  const totalStock = dataToUse.reduce((sum, p) => sum + Number(p.stock || 0), 0);

  // นับ unique brands จาก products ทั้งหมดเสมอ
  const uniqueBrands = [...new Set(
    products
      .map(p => p.brand?.trim())
      .filter(b => b && b.length > 0)
  )];

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-stock").textContent = totalStock;

  const brandsEl = document.getElementById("stat-brands");
  if (brandsEl) brandsEl.textContent = uniqueBrands.length;
}

// ─── FORM MANAGEMENT ───────────────────────────────────────────────
function openAddForm() {
  currentEditId = null;
  document.getElementById("modalTitle").textContent = "Add New Product";
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  openModal("productModal");
}

function openEditForm(product) {
  currentEditId = product.id;
  document.getElementById("modalTitle").textContent = "Edit Product";

  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name;
  document.getElementById("productBrand").value = product.brand || "";
  document.getElementById("productCategory").value = product.category_id || "";
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productStock").value = product.stock;
  document.getElementById("productImage").value = product.image_url || "";
  document.getElementById("productDescription").value =
    product.description || "";

  if (product.specs) {
    try {
      const specsStr =
        typeof product.specs === "string"
          ? product.specs
          : JSON.stringify(product.specs);
      document.getElementById("productSpecs").value = specsStr;
    } catch (e) {
      document.getElementById("productSpecs").value = "";
    }
  }

  openModal("productModal");
}

function closeProductForm() {
  closeModal("productModal");
  currentEditId = null;
}

async function saveProduct(e) {
  e.preventDefault();

  // ✅ จำ category ที่เลือกอยู่ก่อน
  const currentCategory = document.getElementById("categoryFilter").value;

  const id = document.getElementById("productId").value;
  const formData = {
    name: document.getElementById("productName").value,
    brand: document.getElementById("productBrand").value,
    category_id: document.getElementById("productCategory").value || null,
    price: parseFloat(document.getElementById("productPrice").value),
    stock: parseInt(document.getElementById("productStock").value) || 0,
    image_url: document.getElementById("productImage").value,
    description: document.getElementById("productDescription").value,
    specs: null,
  };

  const specsStr = document.getElementById("productSpecs").value.trim();
  if (specsStr) {
    try {
      formData.specs = JSON.parse(specsStr);
    } catch (err) {
      showToast("Invalid JSON in specifications", "error");
      return;
    }
  }

  if (!formData.name || !formData.price) {
    showToast("Name and price are required", "error");
    return;
  }

  const isEditing = !!id;
  const result = isEditing
    ? await apiPut(`/products/${id}`, formData)
    : await apiPost("/products", formData);

  if (result) {
    showToast(
      isEditing ? "✅ Product updated" : "✅ Product created",
      "success"
    );

    closeProductForm();

    // โหลดใหม่
    await loadProducts();

    document.getElementById("categoryFilter").value = currentCategory;

    filterProducts();
  }
}

// ─── DELETE MANAGEMENT ───────────────────────────────────────────
function openDeleteModal(id, name) {
  pendingDeleteId = id;
  document.getElementById("deleteProductInfo").innerHTML = `
    <div><strong>Product:</strong> ${name}</div>
    <div><strong>ID:</strong> #${id}</div>
  `;
  openModal("deleteModal");
}

function closeDeleteModal() {
  closeModal("deleteModal");
  pendingDeleteId = null;
}

async function confirmDelete() {
  if (!pendingDeleteId) return;

  const currentCategory = document.getElementById("categoryFilter").value;

  const result = await apiDelete(`/products/${pendingDeleteId}`);

  if (result && result.success) {
    showToast("✅ Product deleted", "success");
    closeDeleteModal();

    await loadProducts();

    document.getElementById("categoryFilter").value = currentCategory;

    filterProducts();
  }
}

// ─── SEARCH & FILTER ───────────────────────────────────────────────
function filterProducts() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const categoryFilter = document.getElementById("categoryFilter").value;

  filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm);

    const matchesCategory =
      !categoryFilter || product.category_id == categoryFilter;

    return matchesSearch && matchesCategory;
  });

  renderProductsTable();
  updateStats();
}

// ─── EDIT PRODUCT SHORTCUT ───────────────────────────────────────
function editProduct(id) {
  const product = products.find((p) => p.id === id);
  if (product) {
    openEditForm(product);
  }
}

// ─── MODAL HELPERS ────────────────────────────────────────────────
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "auto";
  }
}

// Close modal when clicking overlay
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
    document.body.style.overflow = "auto";
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay.open").forEach((modal) => {
      modal.classList.remove("open");
      document.body.style.overflow = "auto";
    });
  }
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(400px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── EVENT LISTENERS ──────────────────────────────────────────────
function setupEventListeners() {
  // Handle Enter key in search
  document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      filterProducts();
    }
  });
}

// ─── INIT ON LOAD ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);

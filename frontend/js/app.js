// ─── CONFIG ───────────────────────────────────────────────────────
const API_BASE = "/api";

// ─── CATEGORY ICON MAP ────────────────────────────────────────────
const CATEGORY_ICONS = {
  'cpu':         'fa-solid fa-microchip',
  'motherboard': 'fa-solid fa-server',
  'gpu':         'fa-solid fa-microchip',
  'ram':         'fa-solid fa-memory',
  'storage':     'fa-solid fa-hard-drive',
  'psu':         'fa-solid fa-plug',
  'cooling':     'fa-solid fa-fan',
  'cases':       'fa-solid fa-computer',
  'monitor':     'fa-solid fa-display',
};

function getCategoryIcon(slug) {
  const cls = CATEGORY_ICONS[slug] || "fa-solid fa-microchip";
  return `<i class="${cls}"></i>`;
}

// ─── STATE ────────────────────────────────────────────────────────
// ── migrate cart เก่าที่ไม่มี stock field ออกทันที ──
(function migrateCart() {
  try {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    if (stored.some(i => i.stock === undefined || i.stock === null)) {
      localStorage.removeItem("cart");
    }
  } catch (e) {
    localStorage.removeItem("cart");
  }
})();

let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let currentCategory = "";
let currentSort = "id";
let currentOrder = "ASC";
let searchQuery = "";
let allCategories = [];

// ─── API HELPERS ──────────────────────────────────────────────────
async function apiFetch(endpoint) {
  try {
    const res = await fetch(API_BASE + endpoint);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    console.error("API fetch error:", err);
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
    return await res.json();
  } catch (err) {
    console.error("API post error:", err);
    return null;
  }
}

// ─── CART ─────────────────────────────────────────────────────────
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const badge = document.querySelector(".cart-badge");
  if (!badge) return;
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  badge.textContent = count;
  badge.classList.toggle("visible", count > 0);
}

function addToCart(product, qty = 1) {
  const existing = cart.find((i) => i.product_id === product.id);
  const maxStock = Number(product.stock) || 0;

  if (maxStock === 0) {
    showToast("สินค้าหมดสต็อก", "error");
    return;
  }

  if (existing) {
    existing.stock = maxStock; // อัปเดต stock ล่าสุดเสมอ
    const newQty = existing.quantity + qty;
    if (newQty > maxStock) {
      showToast(`มีสินค้าแค่ ${maxStock} ชิ้น`, "error");
      existing.quantity = maxStock;
    } else {
      existing.quantity = newQty;
    }
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image_url: product.image_url,
      brand: product.brand,
      quantity: Math.min(qty, maxStock),
      stock: maxStock,  // ← เก็บ stock ไว้เสมอ
    });
  }
  saveCart();
  showToast(`Added "${product.name}" to cart`);
}

function removeFromCart(productId) {
  cart = cart.filter((i) => i.product_id !== productId);
  saveCart();
}

function updateCartQty(productId, delta) {
  const item = cart.find((i) => i.product_id === productId);
  if (!item) return;

  // ถ้าไม่มี stock field (cart เก่า) ให้ fetch จาก API แล้ว update
  const maxStock = Number(item.stock);
  if (!maxStock && maxStock !== 0) {
    showToast("กรุณาลบสินค้าแล้วเพิ่มใหม่", "error");
    return;
  }

  const newQty = item.quantity + delta;
  if (newQty < 1) return;
  if (newQty > maxStock) {
    showToast(`มีสินค้าแค่ ${maxStock} ชิ้น`, "error");
    return;
  }
  item.quantity = newQty;
  saveCart();
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function renderCart() {
  const itemsEl = document.querySelector(".cart-items");
  const emptyEl = document.querySelector(".cart-empty");
  const totalEl = document.querySelector(".cart-total-price");
  const checkoutBtn = document.querySelector(".btn-checkout");
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.style.display = "none";
    if (emptyEl) emptyEl.style.display = "flex";
    if (totalEl) totalEl.textContent = "฿0";
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  itemsEl.style.display = "flex";
  if (emptyEl) emptyEl.style.display = "none";
  if (checkoutBtn) checkoutBtn.disabled = false;

  itemsEl.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.image_url || "https://placehold.co/60x60/141720/00d4ff?text=PC"}"
           alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">฿${formatPrice(item.price * item.quantity)}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateCartQty(${item.product_id}, -1)" style="width:24px;height:24px;font-size:12px">
            <i class="fa-solid fa-minus"></i>
          </button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button class="qty-btn" onclick="updateCartQty(${item.product_id}, 1)" style="width:24px;height:24px;font-size:12px"
                  ${item.quantity >= (item.stock || 0) ? "disabled" : ""}>
            <i class="fa-solid fa-plus"></i>
          </button>
          <button class="btn-remove" onclick="removeFromCart(${item.product_id})">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:2px;font-family:var(--font-mono)">
          stock: ${item.stock || 0}
        </div>
      </div>
    </div>
  `,
    )
    .join("");

  if (totalEl) totalEl.textContent = `฿${formatPrice(getCartTotal())}`;
}

// ─── PRODUCT RENDERING ────────────────────────────────────────────
function formatPrice(num) {
  return Number(num).toLocaleString("th-TH");
}

function getStockBadge(stock) {
  if (stock <= 0)
    return '<span class="stock-indicator out-stock"><i class="fa-solid fa-circle-xmark"></i> OUT OF STOCK</span>';
  if (stock <= 5)
    return `<span class="stock-indicator low-stock"><i class="fa-solid fa-triangle-exclamation"></i> LOW STOCK: ${stock}</span>`;
  return `<span class="stock-indicator in-stock"><i class="fa-solid fa-circle-check"></i> IN STOCK</span>`;
}

// Product card click registry
const _productRegistry = {};

function renderProductCard(p) {
  _productRegistry[p.id] = p;
  return `
    <div class="product-card" onclick="openProductModal(${p.id})">
      <div class="product-img-wrap">
        <img src="${p.image_url || "https://placehold.co/500x400/141720/00d4ff?text=PC"}"
             alt="${p.name}" loading="lazy">
        <span class="product-category-badge">${p.category_name || "Component"}</span>
      </div>
      <div class="product-info">
        <div class="product-brand">${p.brand || ""}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.description || ""}</div>
      </div>
      <div class="product-footer">
        <div>
          <div class="product-price">฿${formatPrice(p.price)}</div>
          ${getStockBadge(p.stock)}
        </div>
        <button class="btn-add-cart" data-product-id="${p.id}" ${p.stock <= 0 ? "disabled" : ""}>
          <i class="fa-solid fa-cart-plus"></i> Add
        </button>
      </div>
    </div>
  `;
}

// Delegated click handler for add-to-cart buttons - opens modal only
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-add-cart[data-product-id]");
  if (btn) {
    e.stopPropagation();
    const id = parseInt(btn.dataset.productId);
    openProductModal(id);
  }
});

// ─── PRODUCT MODAL ────────────────────────────────────────────────
let modalQty = 1;
let modalProduct = null;

async function openProductModal(id) {
  const overlay = document.querySelector(".modal-overlay");
  if (!overlay) return;

  overlay.querySelector(".modal-body").innerHTML = `
    <div class="skeleton" style="height:300px;grid-column:1/-1"></div>
  `;
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";

  const product = await apiFetch(`/products/${id}`);
  if (!product) return;

  modalProduct = product;
  modalQty = 1;

  // คำนวณ qty ที่มีอยู่ในตะกร้าแล้ว
  const inCart = cart.find(i => i.product_id === product.id);
  const alreadyInCart = inCart ? inCart.quantity : 0;
  const remaining = Number(product.stock) - alreadyInCart;

  let specsHtml = "";
  if (product.specs) {
    const specs =
      typeof product.specs === "string"
        ? JSON.parse(product.specs)
        : product.specs;
    specsHtml = `
      <div class="specs-grid">
        ${Object.entries(specs)
          .map(([k, v]) => `
          <div class="spec-item">
            <span class="spec-key">${k.replace(/_/g, " ")}</span>
            <span class="spec-val">${v}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  overlay.querySelector(".modal-body").innerHTML = `
    <div>
      <img src="${product.image_url || "https://placehold.co/500x400/141720/00d4ff?text=PC"}"
           alt="${product.name}" class="modal-img">
    </div>
    <div class="modal-info">
      <div class="modal-brand">${product.brand || ""} · ${product.category_name || ""}</div>
      <div class="modal-name">${product.name}</div>
      <div class="modal-price">฿${formatPrice(product.price)} <small>THB</small></div>
      <p class="modal-desc">${product.description || ""}</p>
      ${getStockBadge(product.stock)}
      ${alreadyInCart > 0 ? `<div style="font-size:12px;color:var(--accent);font-family:var(--font-mono);margin-top:4px"><i class="fa-solid fa-cart-shopping" style="margin-right:4px"></i>In cart: ${alreadyInCart} · Available to add: ${remaining}</div>` : ''}
      ${specsHtml}
      <div class="modal-actions">
        <div class="qty-control">
          <button class="qty-btn" onclick="event.stopPropagation(); changeModalQty(-1)"><i class="fa-solid fa-minus"></i></button>
          <span class="qty-display" id="modal-qty">1</span>
          <button class="qty-btn" onclick="event.stopPropagation(); changeModalQty(1)"><i class="fa-solid fa-plus"></i></button>
        </div>
        <button class="btn-primary" onclick="addModalToCart()" style="flex:1"
                ${product.stock <= 0 || remaining <= 0 ? "disabled" : ""}>
          <i class="fa-solid fa-cart-plus"></i> ${remaining <= 0 ? "Already max in cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  `;
}

function changeModalQty(delta) {
  if (!modalProduct) return;
  const maxStock = Number(modalProduct.stock) || 0;

  // คำนวณ qty ที่มีในตะกร้าแล้ว
  const inCart = cart.find(i => i.product_id === modalProduct.id);
  const alreadyInCart = inCart ? inCart.quantity : 0;
  const maxCanAdd = maxStock - alreadyInCart;

  const newQty = modalQty + delta;
  if (newQty < 1) return;
  if (newQty > maxCanAdd) {
    showToast(`เพิ่มได้อีกแค่ ${maxCanAdd} ชิ้น (มีในตะกร้าแล้ว ${alreadyInCart})`, "error");
    return;
  }
  modalQty = newQty;
  const el = document.getElementById("modal-qty");
  if (el) el.textContent = modalQty;
}

function addModalToCart() {
  if (!modalProduct) return;
  addToCart(modalProduct, modalQty);
  closeModal();
}

function closeModal() {
  const overlay = document.querySelector(".modal-overlay");
  if (overlay) overlay.classList.remove("open");
  document.body.style.overflow = "";
  modalProduct = null;
}

// ─── TOAST ────────────────────────────────────────────────────────
function showToast(msg, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast${type === "error" ? " error" : ""}`;
  const icon =
    type === "error"
      ? '<i class="fa-solid fa-circle-exclamation"></i>'
      : '<i class="fa-solid fa-circle-check"></i>';
  toast.innerHTML = `${icon} ${msg}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("out");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
}

// ─── CART SIDEBAR ─────────────────────────────────────────────────
function openCart() {
  document.querySelector(".cart-sidebar")?.classList.add("open");
  document.querySelector(".cart-overlay")?.classList.add("open");
  document.body.style.overflow = "hidden";
  renderCart();
}

function closeCart() {
  document.querySelector(".cart-sidebar")?.classList.remove("open");
  document.querySelector(".cart-overlay")?.classList.remove("open");
  document.body.style.overflow = "";
}

async function checkout() {
  if (cart.length === 0) return;
  const btn = document.querySelector(".btn-checkout");
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> PROCESSING...';
    btn.disabled = true;
  }

  const result = await apiPost("/cart/checkout", {
    session_id: `guest_${Date.now()}`,
    items: cart,
  });

  if (result && result.success) {
    cart = [];
    saveCart();
    closeCart();
    showToast(`Order #${result.order_id} confirmed! Total ฿${formatPrice(result.total)}`);
  } else {
    const errMsg = result?.error || "Checkout failed. Please try again.";
    showToast(errMsg, "error");
    if (btn) {
      btn.innerHTML = "CHECKOUT";
      btn.disabled = false;
    }
  }
}

// ─── CATEGORIES ───────────────────────────────────────────────────
async function loadCategories(container, withAll = true) {
  const res = await apiFetch("/categories");
  if (!res || !container) return;

  const cats = Array.isArray(res) ? res : res.categories || [];
  allCategories = cats;

  const allHtml = withAll
    ? `
    <a class="category-card ${!currentCategory ? "active" : ""}" onclick="filterByCategory('')">
      <span class="category-icon">${getCategoryIcon("all")}</span>
      <span class="category-name">All</span>
      <span class="category-count">${cats.reduce((s, c) => s + (c.product_count || 0), 0)} items</span>
    </a>
  `
    : "";

  container.innerHTML =
    allHtml +
    cats.map((c) => `
    <a class="category-card ${currentCategory === c.slug ? "active" : ""}" onclick="filterByCategory('${c.slug}')">
      <span class="category-icon">${getCategoryIcon(c.slug)}</span>
      <span class="category-name">${c.name}</span>
      <span class="category-count">${c.product_count || 0} items</span>
    </a>
  `).join("");
}

function filterByCategory(slug) {
  currentCategory = slug;
  document.querySelectorAll(".category-card").forEach((c) => {
    const isAll = c.getAttribute("onclick")?.includes("''");
    const isThis = c.getAttribute("onclick")?.includes(`'${slug}'`);
    c.classList.toggle("active", slug === "" ? isAll : isThis);
  });
  loadProducts();
}

// ─── PRODUCTS ─────────────────────────────────────────────────────
async function loadProducts() {
  const grid = document.querySelector(".products-grid");
  if (!grid) return;

  grid.innerHTML = Array(8)
    .fill(0)
    .map(() => `<div class="skeleton" style="height:340px"></div>`)
    .join("");

  let qs = "";
  if (currentCategory) qs += `&category=${encodeURIComponent(currentCategory)}`;
  if (searchQuery) qs += `&search=${encodeURIComponent(searchQuery)}`;
  qs += `&sort=${currentSort}&order=${currentOrder}`;

  const data = await apiFetch(`/products?${qs.slice(1)}`);

  if (!data || !data.products) {
    grid.innerHTML = `<div class="products-empty"><p><i class="fa-solid fa-triangle-exclamation" style="margin-right:8px"></i>Failed to load products.</p></div>`;
    return;
  }

  if (data.products.length === 0) {
    grid.innerHTML = `<div class="products-empty"><p><i class="fa-solid fa-box-open" style="margin-right:8px"></i>No products found.</p></div>`;
    return;
  }

  grid.innerHTML = data.products.map((p) => renderProductCard(p)).join("");
  updateProductCountLabel(data.products.length);
}

function updateProductCountLabel(count) {
  const label = document.getElementById("product-count-label");
  if (!label) return;
  let text = "";
  if (currentCategory || searchQuery) {
    if (currentCategory && searchQuery) {
      text = `${count} products in selected category matching "${searchQuery}"`;
    } else if (currentCategory) {
      text = `${count} products in selected category`;
    } else {
      text = `${count} products matching "${searchQuery}"`;
    }
  } else {
    text = "Browse our full range of computer hardware";
  }
  label.textContent = text;
}

// ─── SEARCH ───────────────────────────────────────────────────────
function initSearch() {
  const input = document.querySelector(".search-bar input");
  if (!input) return;
  let timeout;
  input.addEventListener("input", (e) => {
    clearTimeout(timeout);
    searchQuery = e.target.value.trim();
    timeout = setTimeout(() => loadProducts(), 400);
  });
}

// ─── SORT & FILTER ────────────────────────────────────────────────
function initSort() {
  const sortSelect = document.getElementById("sort-select");
  if (!sortSelect) return;
  sortSelect.addEventListener("change", (e) => {
    const [sort, order] = e.target.value.split("-");
    currentSort = sort;
    currentOrder = order;
    loadProducts();
  });
}

function clearFilters() {
  currentCategory = "";
  searchQuery = "";
  currentSort = "id";
  currentOrder = "ASC";
  document.getElementById("sort-select")?.setAttribute("value", "id-ASC");
  const searchInput = document.querySelector(".search-bar input");
  if (searchInput) searchInput.value = "";
  document.querySelectorAll(".category-card").forEach((c) => {
    c.classList.toggle("active", c.getAttribute("onclick")?.includes("''"));
  });
  loadCategories(document.querySelector("#category-chips"));
  loadProducts();
}

// ─── NAV & MOBILE MENU ────────────────────────────────────────────
function initNav() {
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }

  document.querySelectorAll(".mobile-menu a").forEach((a) => {
    a.addEventListener("click", () => mobileMenu?.classList.remove("open"));
  });

  const path = window.location.pathname;
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (href === "/index.html" && path === "/")) {
      a.classList.add("active");
    } else if (href && path.includes(href) && href !== "/index.html") {
      a.classList.add("active");
    }
  });
}

// ─── INIT ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initSearch();
  updateCartBadge();

  document.querySelector(".btn-cart")?.addEventListener("click", openCart);
  document.querySelector(".cart-overlay")?.addEventListener("click", closeCart);
  document.querySelector(".cart-close-btn")?.addEventListener("click", closeCart);
  document.querySelector(".btn-checkout")?.addEventListener("click", checkout);

  document.querySelector(".modal-overlay")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.querySelector(".btn-close")?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeModal(); closeCart(); }
  });
});

// Make functions global
window.filterByCategory = filterByCategory;
window.openProductModal = openProductModal;
window.changeModalQty = changeModalQty;
window.addModalToCart = addModalToCart;
window.closeModal = closeModal;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQty = updateCartQty;
window.openCart = openCart;
window.closeCart = closeCart;
window.checkout = checkout;
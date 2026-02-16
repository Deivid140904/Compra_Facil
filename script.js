// ==========================
// Mercadinho Livre (Demo)
// ==========================

const fmtBRL = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const baseProducts = [
  { id: 1, title: "Fone Bluetooth Pro", price: 189.9, oldPrice: 249.9, rating: 4.7, sold: 1200, freeShipping: true, stock: 18, category: "Eletrônicos", emoji: "🎧", promo: true },
  { id: 2, title: "Air Fryer 4L Inox", price: 399.0, oldPrice: 479.0, rating: 4.8, sold: 980, freeShipping: true, stock: 7, category: "Casa", emoji: "🍟", promo: true },
  { id: 3, title: "Mouse Gamer RGB", price: 99.9, oldPrice: 129.9, rating: 4.5, sold: 5400, freeShipping: false, stock: 0, category: "Games", emoji: "🖱️", promo: false },
  { id: 4, title: "Kit Skincare Hidratante", price: 79.9, oldPrice: 0, rating: 4.6, sold: 860, freeShipping: false, stock: 25, category: "Beleza", emoji: "🧴", promo: false },
  { id: 5, title: "Tênis Casual Confort", price: 159.9, oldPrice: 199.9, rating: 4.4, sold: 2100, freeShipping: true, stock: 12, category: "Moda", emoji: "👟", promo: true },
  { id: 6, title: "Smart Lâmpada Wi-Fi", price: 49.9, oldPrice: 69.9, rating: 4.3, sold: 3200, freeShipping: true, stock: 33, category: "Casa", emoji: "💡", promo: false },
  { id: 7, title: "Teclado Mecânico 60%", price: 229.9, oldPrice: 299.9, rating: 4.7, sold: 640, freeShipping: false, stock: 9, category: "Games", emoji: "⌨️", promo: true },
  { id: 8, title: "Power Bank 20.000mAh", price: 119.9, oldPrice: 149.9, rating: 4.6, sold: 1700, freeShipping: true, stock: 21, category: "Eletrônicos", emoji: "🔋", promo: false },
  { id: 9, title: "Jaqueta Jeans Oversized", price: 139.9, oldPrice: 0, rating: 4.2, sold: 430, freeShipping: false, stock: 4, category: "Moda", emoji: "🧥", promo: false },
];

let products = [...baseProducts];
let cart = loadCart();

const productsGrid = document.getElementById("productsGrid");
const emptyState = document.getElementById("emptyState");
const resultsInfo = document.getElementById("resultsInfo");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const maxPrice = document.getElementById("maxPrice");
const freeShipping = document.getElementById("freeShipping");
const inStock = document.getElementById("inStock");

const productsCount = document.getElementById("productsCount");
const freeShipCount = document.getElementById("freeShipCount");
const avgRating = document.getElementById("avgRating");

const cartCount = document.getElementById("cartCount");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");

const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotal = document.getElementById("cartTotal");
const clearCartBtn = document.getElementById("clearCartBtn");

const toast = document.getElementById("toast");

let activeCategory = "Todos";

function render() {
  const list = applyFilters(products);
  renderStats(list);
  renderGrid(list);
  renderCart();
  renderCartBadge();
}

function renderGrid(list) {
  productsGrid.innerHTML = "";
  resultsInfo.textContent = list.length;

  if (!list.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  list.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <div class="card__img"><span>${p.emoji}</span></div>
      <div class="card__body">
        <h3 class="card__title">${p.title}</h3>

        <div class="tags">
          <span class="tag">${p.category}</span>
          ${p.freeShipping ? `<span class="tag tag--free">Frete grátis</span>` : ""}
          ${p.stock <= 0 ? `<span class="tag tag--stockout">Sem estoque</span>` : ""}
        </div>

        <div class="price-row">
          <div class="price">${fmtBRL(p.price)}</div>
        </div>

        <div class="meta">
          <span>⭐ ${p.rating}</span>
          <span>${p.sold} vendidos</span>
        </div>

        <div class="card__actions">
          <button class="btn btn--primary" data-add="${p.id}" ${
      p.stock <= 0 ? "disabled" : ""
    }>
            ${p.stock <= 0 ? "Indisponível" : "Adicionar"}
          </button>
        </div>
      </div>
    `;

    productsGrid.appendChild(card);
  });
}

function renderStats(list) {
  productsCount.textContent = list.length;
  freeShipCount.textContent = list.filter((p) => p.freeShipping).length;
  const avg = list.reduce((a, p) => a + p.rating, 0) / (list.length || 1);
  avgRating.textContent = avg.toFixed(1);
}

function renderCart() {
  const items = Object.values(cart);
  cartItems.innerHTML = "";

  if (!items.length) {
    cartEmpty.hidden = false;
    cartTotal.textContent = fmtBRL(0);
    return;
  }

  cartEmpty.hidden = true;

  let total = 0;

  items.forEach((it) => {
    const p = it.product;
    const sub = p.price * it.qty;
    total += sub;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item__img">${p.emoji}</div>
      <div>
        <p class="cart-item__title">${p.title}</p>
        <div class="cart-item__meta">
          <span>${fmtBRL(p.price)}</span>
        </div>
      </div>
      <div class="qty">
        <button data-dec="${p.id}">−</button>
        <span>${it.qty}</span>
        <button data-inc="${p.id}">+</button>
      </div>
    `;
    cartItems.appendChild(row);
  });

  cartTotal.textContent = fmtBRL(total);
}

function renderCartBadge() {
  const count = Object.values(cart).reduce((a, it) => a + it.qty, 0);
  cartCount.textContent = count;
}

function addToCart(id) {
  const p = products.find((x) => x.id == id);
  if (!p) return;

  if (!cart[id]) cart[id] = { product: p, qty: 1 };
  else cart[id].qty++;

  saveCart(cart);
  showToast("Produto adicionado!");
  render();
}

function incQty(id) {
  cart[id].qty++;
  saveCart(cart);
  render();
}

function decQty(id) {
  cart[id].qty--;
  if (cart[id].qty <= 0) delete cart[id];
  saveCart(cart);
  render();
}

function clearCart() {
  cart = {};
  saveCart(cart);
  render();
}

function applyFilters(list) {
  let r = [...list];

  const q = searchInput.value.toLowerCase();
  if (q) r = r.filter((p) => p.title.toLowerCase().includes(q));

  const mp = Number(maxPrice.value);
  if (mp) r = r.filter((p) => p.price <= mp);

  if (freeShipping.checked) r = r.filter((p) => p.freeShipping);
  if (inStock.checked) r = r.filter((p) => p.stock > 0);

  if (sortSelect.value === "price-asc") r.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price-desc") r.sort((a, b) => b.price - a.price);

  return r;
}

// ===== Drawer =====

function openCart() {
  cartDrawer.classList.add("open");
  overlay.hidden = false;
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.hidden = true;
}

// ===== Toast =====

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(() => (toast.hidden = true), 2000);
}

// ===== Storage =====

function saveCart(c) {
  localStorage.setItem("cartML", JSON.stringify(c));
}

function loadCart() {
  return JSON.parse(localStorage.getItem("cartML") || "{}");
}

// ===== Eventos =====

document.addEventListener("click", (e) => {
  if (e.target.dataset.add) addToCart(e.target.dataset.add);
  if (e.target.dataset.inc) incQty(e.target.dataset.inc);
  if (e.target.dataset.dec) decQty(e.target.dataset.dec);
});

searchInput.addEventListener("input", render);
sortSelect.addEventListener("change", render);
maxPrice.addEventListener("input", render);
freeShipping.addEventListener("change", render);
inStock.addEventListener("change", render);

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
clearCartBtn.addEventListener("click", clearCart);

render();

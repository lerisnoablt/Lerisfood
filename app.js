const ADMIN_PIN = "1234";

const products = [
  { id:"milkshake-fraise", name:"Milkshake Fraise", category:"Milkshakes", price:4.00, emoji:"🍓", color:"#ff6b8a", desc:"Milkshake frais, doux et fruité à la fraise." },
  { id:"milkshake-chocolat", name:"Milkshake Chocolat", category:"Milkshakes", price:4.00, emoji:"🍫", color:"#7b3f24", desc:"Milkshake gourmand au chocolat." },
  { id:"milkshake-oreo", name:"Milkshake Oreo", category:"Milkshakes", price:4.50, emoji:"🍪", color:"#2f2f35", desc:"Milkshake crémeux avec goût Oreo." },
  { id:"milkshake-caramel", name:"Milkshake Caramel", category:"Milkshakes", price:4.50, emoji:"🍯", color:"#c77619", desc:"Milkshake sucré et fondant au caramel." },
  { id:"caipirinha-fraise", name:"Caipiriña Fraise", category:"Caipiriñas", price:3.50, emoji:"🍓", color:"#ff5d73", desc:"Boisson fraîche et fruitée à la fraise." },
  { id:"caipirinha-citron", name:"Caipiriña Citron", category:"Caipiriñas", price:3.50, emoji:"🍋", color:"#a7df2a", desc:"Boisson fraîche au citron." },
  { id:"caipirinha-gingembre", name:"Caipiriña Gingembre", category:"Caipiriñas", price:3.50, emoji:"🫚", color:"#d69b54", desc:"Boisson fraîche au gingembre." },
  { id:"caipirinha-maracuja", name:"Caipiriña Maracujá", category:"Caipiriñas", price:3.50, emoji:"🥭", color:"#ffb000", desc:"Boisson tropicale au fruit de la passion." },
  { id:"crepe-confiture", name:"Crêpe Confiture", category:"Crêpes", price:2.50, emoji:"🍓", color:"#ff6b6b", desc:"Crêpe sucrée à la confiture." },
  { id:"crepe-nutella", name:"Crêpe Nutella", category:"Crêpes", price:3.00, emoji:"🍫", color:"#7b3f24", desc:"Crêpe gourmande au Nutella." },
  { id:"crepe-jambon-fromage", name:"Crêpe Jambon Fromage", category:"Crêpes", price:4.00, emoji:"🧀", color:"#ffcc5c", desc:"Crêpe salée jambon fromage." },
  { id:"crepe-saucisse", name:"Crêpe Saucisse", category:"Crêpes", price:4.00, emoji:"🌭", color:"#c45a2d", desc:"Crêpe salée à la saucisse." }
];

let cart = JSON.parse(localStorage.getItem("lerisfood_cart_github") || "[]");
let orders = JSON.parse(localStorage.getItem("lerisfood_orders_github") || "[]");
let adminUnlocked = sessionStorage.getItem("lerisfood_admin") === "yes";

function money(value) {
  return Number(value).toFixed(2).replace(".", ",") + " €";
}

function save() {
  localStorage.setItem("lerisfood_cart_github", JSON.stringify(cart));
  localStorage.setItem("lerisfood_orders_github", JSON.stringify(orders));
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1700);
}

function goTo(route) {
  location.hash = route;
}

function router() {
  const route = (location.hash || "#accueil").replace("#", "");
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  const page = document.getElementById("page-" + route);
  (page || document.getElementById("page-accueil")).classList.add("active");

  document.querySelectorAll(".nav a").forEach(a => {
    a.classList.toggle("active", a.dataset.route === route);
  });

  if (route === "menu") renderProducts();
  if (route === "panier") renderCart();
  if (route === "admin") renderAdmin();
}

window.addEventListener("hashchange", router);

function setCategory(category, btn) {
  document.getElementById("categoryFilter").value = category;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const search = document.getElementById("searchInput").value.toLowerCase().trim();
  const category = document.getElementById("categoryFilter").value;
  const sort = document.getElementById("sortFilter").value;

  let list = [...products];

  if (search) {
    list = list.filter(p => (p.name + " " + p.category + " " + p.desc).toLowerCase().includes(search));
  }

  if (category !== "all") {
    list = list.filter(p => p.category === category);
  }

  if (sort === "priceAsc") list.sort((a,b) => a.price - b.price);
  if (sort === "priceDesc") list.sort((a,b) => b.price - a.price);
  if (sort === "name") list.sort((a,b) => a.name.localeCompare(b.name));

  if (list.length === 0) {
    grid.innerHTML = `<div class="empty">Aucun produit trouvé.</div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <article class="product">
      <div class="product-image">
        <div class="blob" style="background:${p.color}"></div>
        <span class="badge">${p.category}</span>
        <span class="product-emoji">${p.emoji}</span>
      </div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-footer">
          <span class="price">${money(p.price)}</span>
          <button class="btn btn-primary" onclick="addToCart('${p.id}')">Ajouter</button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const item = cart.find(i => i.id === id);

  if (item) item.qty += 1;
  else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });

  save();
  updateCartCount();
  toast(product.name + " ajouté");
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);

  save();
  updateCartCount();
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartCount() {
  document.getElementById("cartCount").textContent = cartCount();
}

function renderCart() {
  const container = document.getElementById("cartContainer");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <p>Ton panier est vide.</p><br>
        <button class="btn btn-primary" onclick="goTo('menu')">Retour au menu</button>
      </div>
    `;
    document.getElementById("checkoutForm").classList.add("hidden");
    return;
  }

  document.getElementById("checkoutForm").classList.remove("hidden");

  container.innerHTML = `
    <div class="cart-card">
      ${cart.map(item => `
        <div class="cart-line">
          <div>
            <strong>${item.name}</strong><br>
            <small>${money(item.price)} x ${item.qty}</small>
          </div>
          <div class="qty">
            <button onclick="changeQty('${item.id}', -1)">−</button>
            <strong>${item.qty}</strong>
            <button onclick="changeQty('${item.id}', 1)">+</button>
          </div>
          <strong>${money(item.price * item.qty)}</strong>
        </div>
      `).join("")}
      <div class="total-box">
        <span>Total à payer sur place</span>
        <strong>${money(cartTotal())}</strong>
      </div>
    </div>
  `;
}

document.getElementById("checkoutForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("clientName").value.trim();
  const phone = document.getElementById("clientPhone").value.trim();
  const note = document.getElementById("clientNote").value.trim();
  const sauces = [...document.querySelectorAll(".checks input:checked")].map(i => i.value);

  if (cart.length === 0) return toast("Panier vide");
  if (!name) return toast("Ajoute le nom du client");

  const order = {
    id: Date.now(),
    number: orders.length + 1,
    createdAt: new Date().toLocaleString("fr-FR"),
    name,
    phone,
    note,
    sauces,
    items: cart.map(i => ({...i})),
    total: cartTotal(),
    status: "À préparer"
  };

  orders.unshift(order);
  cart = [];

  document.getElementById("clientName").value = "";
  document.getElementById("clientPhone").value = "";
  document.getElementById("clientNote").value = "";
  document.querySelectorAll(".checks input").forEach(i => i.checked = false);

  save();
  updateCartCount();
  goTo("merci");
});

function unlockAdmin() {
  const code = document.getElementById("adminCode").value.trim();
  if (code !== ADMIN_PIN) return toast("Code incorrect");

  adminUnlocked = true;
  sessionStorage.setItem("lerisfood_admin", "yes");
  renderAdmin();
}

function lockAdmin() {
  adminUnlocked = false;
  sessionStorage.removeItem("lerisfood_admin");
  renderAdmin();
}

function renderAdmin() {
  document.getElementById("adminLogin").classList.toggle("hidden", adminUnlocked);
  document.getElementById("adminPanel").classList.toggle("hidden", !adminUnlocked);

  if (!adminUnlocked) return;

  const list = document.getElementById("ordersList");

  if (orders.length === 0) {
    list.innerHTML = `<div class="empty">Aucune commande pour le moment.</div>`;
    return;
  }

  list.innerHTML = orders.map(order => {
    const statusClass = order.status === "Prêt" ? "ready" : order.status === "Terminé" ? "done" : "";
    return `
      <article class="order-card">
        <div class="order-top">
          <div>
            <strong>Commande #${order.number}</strong><br>
            <small>${order.createdAt}</small><br>
            <span>${order.name}${order.phone ? " • " + order.phone : ""}</span>
          </div>
          <span class="status ${statusClass}">${order.status}</span>
        </div>

        <div>
          ${order.items.map(i => `${i.qty}x ${i.name} — ${money(i.price * i.qty)}`).join("<br>")}
          <br><strong>Total : ${money(order.total)}</strong>
          ${order.sauces.length ? `<br>🌶️ Sauces : ${order.sauces.join(", ")}` : ""}
          ${order.note ? `<br>📝 Note : ${order.note}` : ""}
        </div>

        <div class="order-actions">
          <button class="btn btn-primary" onclick="setStatus(${order.id}, 'À préparer')">À préparer</button>
          <button class="btn btn-green" onclick="setStatus(${order.id}, 'Prêt')">Prêt</button>
          <button class="btn btn-outline" onclick="setStatus(${order.id}, 'Terminé')">Terminé</button>
          <button class="btn btn-danger" onclick="deleteOrder(${order.id})">Supprimer</button>
        </div>
      </article>
    `;
  }).join("");
}

function setStatus(id, status) {
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    save();
    renderAdmin();
  }
}

function deleteOrder(id) {
  if (!confirm("Supprimer cette commande ?")) return;
  orders = orders.filter(o => o.id !== id);
  save();
  renderAdmin();
}

function clearOrders() {
  if (!confirm("Effacer toutes les commandes ?")) return;
  orders = [];
  save();
  renderAdmin();
}

function exportOrders() {
  if (orders.length === 0) return toast("Aucune commande à exporter");

  const rows = [["Numero","Date","Client","Telephone","Produits","Sauces","Note","Total","Statut"]];
  orders.forEach(o => {
    rows.push([
      o.number,
      o.createdAt,
      o.name,
      o.phone || "",
      o.items.map(i => `${i.qty}x ${i.name}`).join(" | "),
      o.sauces.join(", "),
      o.note || "",
      money(o.total),
      o.status
    ]);
  });

  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"','""')}"`).join(";")).join("\n");
  const blob = new Blob([csv], { type:"text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "commandes_lerisfood.csv";
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("searchInput").addEventListener("input", renderProducts);
document.getElementById("categoryFilter").addEventListener("change", renderProducts);
document.getElementById("sortFilter").addEventListener("change", renderProducts);

router();
renderProducts();
renderCart();
renderAdmin();
updateCartCount();

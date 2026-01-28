// ====== CONFIG ======
const WHATSAPP_NUMBER = "905339351071"; // no +, no spaces
const INSTAGRAM_URL = "https://instagram.com/"; // <-- replace with your real link

// Products (edit names/prices freely)
const PRODUCTS = [
  { id: "dark",  name: "Dark Chocolate",  price: 180, desc: "Rich, bold, handmade.", tags: ["bestseller"] },
  { id: "milk",  name: "Milk Chocolate",  price: 160, desc: "Smooth, classic taste.", tags: ["bestseller"] },
  { id: "gift",  name: "Gift Box",        price: 320, desc: "Beautiful packaging, perfect gift.", tags: ["bestseller"] },
  { id: "nuts",  name: "Hazelnut Bar",    price: 190, desc: "Crunchy hazelnut pieces.", tags: [] },
  { id: "truff", name: "Truffles (6pc)",  price: 240, desc: "Soft center, premium cocoa.", tags: [] },
  { id: "mix",   name: "Mixed Box",       price: 380, desc: "Variety selection.", tags: [] },
];

const storageKey = "ahmedim_cart_v1";
let cart = loadCart(); // { productId: qty }

// ====== HELPERS ======
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return [...document.querySelectorAll(sel)]; }
function formatTRY(n){ return "₺" + Number(n).toFixed(0); }

function loadCart(){
  try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
  catch { return {}; }
}
function saveCart(){
  localStorage.setItem(storageKey, JSON.stringify(cart));
}

function cartCount(){
  return Object.values(cart).reduce((a,b)=>a+b,0);
}
function subtotal(){
  let sum = 0;
  for (const [id, qty] of Object.entries(cart)){
    const p = PRODUCTS.find(x=>x.id===id);
    if (p) sum += p.price * qty;
  }
  return sum;
}

function setQty(id, qty){
  const next = Math.max(0, Math.min(99, qty));
  if (next === 0) delete cart[id];
  else cart[id] = next;
  saveCart();
  renderCartBadge();
  renderCartDrawer();
  renderProductButtons();
}

// ====== RENDER: Products ======
function productCard(p){
  const qty = cart[p.id] || 0;
  return `
    <div class="card">
      <div class="card__top">
        <div>
          <h3 class="card__title">${escapeHtml(p.name)}</h3>
          <p class="card__desc">${escapeHtml(p.desc)}</p>
        </div>
        <div class="price">${formatTRY(p.price)}</div>
      </div>

      <div class="card__foot">
        <div class="qty" data-id="${p.id}">
          <button type="button" class="dec" aria-label="Decrease">−</button>
          <b class="q">${qty}</b>
          <button type="button" class="inc" aria-label="Increase">+</button>
        </div>
        <button class="btn btn--ghost" type="button" data-add="${p.id}">Add</button>
      </div>
    </div>
  `;
}

function renderProducts(list){
  qs("#productGrid").innerHTML = list.map(productCard).join("");
  bindProductEvents();
}

function renderProductButtons(){
  // Update qty numbers in cards
  qsa(".qty").forEach(el=>{
    const id = el.getAttribute("data-id");
    const q = cart[id] || 0;
    const qEl = el.querySelector(".q");
    if (qEl) qEl.textContent = q;
  });
}

// ====== RENDER: Bestsellers mini list ======
function renderBestsellers(){
  const best = PRODUCTS.filter(p => p.tags?.includes("bestseller")).slice(0,3);
  qs("#miniBestsellers").innerHTML = best.map(p=>{
    const qty = cart[p.id] || 0;
    return `
      <div class="miniItem">
        <div>
          <b>${escapeHtml(p.name)}</b>
          <div class="miniMeta">${formatTRY(p.price)} • In cart: ${qty}</div>
        </div>
        <button class="btn btn--ghost" type="button" data-miniadd="${p.id}">+</button>
      </div>
    `;
  }).join("");

  qsa("[data-miniadd]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-miniadd");
      setQty(id, (cart[id]||0)+1);
      renderBestsellers();
    });
  });
}

// ====== RENDER: Cart Drawer ======
function renderCartBadge(){
  qs("#cartCount").textContent = cartCount();
}

function renderCartDrawer(){
  const items = Object.entries(cart).map(([id, qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    if (!p) return "";
    const line = p.price * qty;
    return `
      <div class="cartItem">
        <div>
          <b>${escapeHtml(p.name)}</b>
          <div class="meta">${formatTRY(p.price)} × ${qty} = ${formatTRY(line)}</div>
        </div>
        <div class="actions">
          <button type="button" data-cdec="${id}">−</button>
          <button type="button" data-cinc="${id}">+</button>
          <button type="button" data-crem="${id}">Remove</button>
        </div>
      </div>
    `;
  });

  qs("#cartItems").innerHTML = items.length ? items.join("") : `<div class="muted">Cart is empty. Add products 🙂</div>`;
  qs("#cartSubtotal").textContent = formatTRY(subtotal());

  // Bind cart controls
  qsa("[data-cdec]").forEach(b=> b.addEventListener("click", ()=> {
    const id = b.getAttribute("data-cdec");
    setQty(id, (cart[id]||0)-1);
    renderBestsellers();
  }));
  qsa("[data-cinc]").forEach(b=> b.addEventListener("click", ()=> {
    const id = b.getAttribute("data-cinc");
    setQty(id, (cart[id]||0)+1);
    renderBestsellers();
  }));
  qsa("[data-crem]").forEach(b=> b.addEventListener("click", ()=> {
    const id = b.getAttribute("data-crem");
    setQty(id, 0);
    renderBestsellers();
  }));
}

// ====== Events: product grid ======
function bindProductEvents(){
  qsa(".qty .inc").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.closest(".qty").getAttribute("data-id");
      setQty(id, (cart[id]||0)+1);
      renderBestsellers();
    });
  });
  qsa(".qty .dec").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.closest(".qty").getAttribute("data-id");
      setQty(id, (cart[id]||0)-1);
      renderBestsellers();
    });
  });
  qsa("[data-add]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-add");
      setQty(id, (cart[id]||0)+1);
      renderBestsellers();
    });
  });
}

// ====== Search + sort

// Main shop script - cleaned and fixed
const categoriesButton = document.getElementById('categoriesButton');
const categoryMenu = document.getElementById('categoryMenu');
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const productGrid = document.getElementById('productGrid');
const cartButton = document.getElementById('cartButton');
const cartCount = document.getElementById('cartCount');
const userAvatar = document.getElementById('userAvatar');
const userMenu = document.getElementById('userMenu');
const categoryFilters = document.getElementById('categoryFilters');
const productModal = document.getElementById('productModal');
const modalImage = document.getElementById('modalImage');
const modalName = document.getElementById('modalName');
const modalPrice = document.getElementById('modalPrice');
const modalDescription = document.getElementById('modalDescription');
const modalAddCart = document.getElementById('modalAddCart');

const PRODUCTS_KEY = 'lojaProducts';
const CART_KEY = 'lojaCart';

const defaultProducts = [
  { name: 'Vestido Longo Floral', price: 129.9, description: 'Leve e elegante para qualquer ocasião.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5B64PUu7Lymi5r24ihRDgpC-N3WQsUSNNA5fhnBvP-Q&s=10', category: 'Vestidos', layout: 'tall', motion: 'float' },
  { name: 'Conjunto de Linho', price: 179.9, description: 'Fresco e confortável para o dia todo.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5B64PUu7Lymi5r24ihRDgpC-N3WQsUSNNA5fhnBvP-Q&s=10', category: 'Conjuntos', layout: 'square', motion: 'static' },
  { name: 'Calça Jeans Destroyed', price: 139.9, description: 'Modelo moderno e versátil.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5B64PUu7Lymi5r24ihRDgpC-N3WQsUSNNA5fhnBvP-Q&s=10', category: 'Calças', layout: 'square', motion: 'float' },
  { name: 'Blusa de Seda', price: 99.9, description: 'Acabamento suave e sofisticado.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5B64PUu7Lymi5r24ihRDgpC-N3WQsUSNNA5fhnBvP-Q&s=10', category: 'Blusas', layout: 'small', motion: 'static' },
  { name: 'Casaco Oversized', price: 219.9, description: 'Visual urbano com muito conforto.', image: 'https://via.placeholder.com/400x480?text=Casaco+Oversized', category: 'Conjuntos', layout: 'tall', motion: 'float' },
  { name: 'Saia Midi Plissada', price: 89.9, description: 'Romântica e feminina para looks elegantes.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5B64PUu7Lymi5r24ihRDgpC-N3WQsUSNNA5fhnBvP-Q&s=10', category: 'Saia', layout: 'small', motion: 'static' },
  { name: 'Vestido Social Preto', price: 159.9, description: 'Clássico e sofisticado para festas.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5B64PUu7Lymi5r24ihRDgpC-N3WQsUSNNA5fhnBvP-Q&s=10', category: 'Vestidos', layout: 'tall', motion: 'static' },
  { name: 'Top Cropped Casual', price: 49.9, description: 'Ideal para looks descontraídos.', image: 'https://via.placeholder.com/400x320?text=Top+Cropped', category: 'Blusas', layout: 'small', motion: 'float' },
  { name: 'Bolsa de Mão Rosa', price: 89.9, description: 'Acessório feminino elegante.', image: 'https://via.placeholder.com/400x320?text=Bolsa+Rosa', category: 'Acessórios', layout: 'small', motion: 'static' },
  { name: 'Vestido Curto Estampado', price: 119.9, description: 'Praia e passeio com muito estilo.', image: 'https://via.placeholder.com/400x400?text=Vestido+Curto', category: 'Vestidos', layout: 'square', motion: 'float' },
  { name: 'Conjunto Fitness', price: 99.9, description: 'Conforto para treinos e corridas.', image: 'https://via.placeholder.com/400x400?text=Conjunto+Fitness', category: 'Conjuntos', layout: 'square', motion: 'static' },
  { name: 'Saia Curta Jeans', price: 69.9, description: 'Estilo jovem e prático.', image: 'https://via.placeholder.com/400x320?text=Saia+Jeans', category: 'Saia', layout: 'small', motion: 'float' }
];

function getProducts() {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
  return [...defaultProducts];
}

// Try to load store from server and persist to localStorage so all clients see admin changes
async function fetchStoreFromServer() {
  try {
    const res = await fetch('/api/store', { cache: 'no-store' });
    if (!res.ok) return null;
    const store = await res.json();
    if (store && typeof store === 'object') {
      if (Array.isArray(store.lojaProducts)) localStorage.setItem(PRODUCTS_KEY, JSON.stringify(store.lojaProducts.map(p => ({ ...p, image: p.img || p.image || p.image || p.img }))));
      if (Array.isArray(store.featuredProducts)) localStorage.setItem('featuredProducts', JSON.stringify(store.featuredProducts));
      if (Array.isArray(store.bestSellers)) localStorage.setItem('bestSellers', JSON.stringify(store.bestSellers));
      if (Array.isArray(store.categorySectionImages)) localStorage.setItem('categorySectionImages', JSON.stringify(store.categorySectionImages));
      return store;
    }
  } catch (e) {
    // ignore network errors and continue using localStorage
  }
  return null;
}

function saveProducts(products) { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }

function getCart() { const stored = localStorage.getItem(CART_KEY); return stored ? JSON.parse(stored) : []; }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function updateCartCount() { const cart = getCart(); const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); cartCount.textContent = totalItems; }

function animateToCart(image) {
  if (!image) return;
  const imgRect = image.getBoundingClientRect();
  const cartRect = cartButton.getBoundingClientRect();
  const clone = image.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = `${imgRect.left}px`;
  clone.style.top = `${imgRect.top}px`;
  clone.style.width = `${imgRect.width}px`;
  clone.style.height = `${imgRect.height}px`;
  clone.style.transition = 'all 0.8s ease-in-out';
  clone.style.zIndex = '1000';
  document.body.appendChild(clone);
  requestAnimationFrame(() => {
    clone.style.left = `${cartRect.left + cartRect.width / 2 - imgRect.width / 4}px`;
    clone.style.top = `${cartRect.top + cartRect.height / 2 - imgRect.height / 4}px`;
    clone.style.width = `${imgRect.width / 2}px`;
    clone.style.height = `${imgRect.height / 2}px`;
    clone.style.opacity = '0.3';
    clone.style.transform = 'rotate(20deg)';
  });
  clone.addEventListener('transitionend', () => { clone.remove(); cartButton.classList.add('cart-added'); setTimeout(() => cartButton.classList.remove('cart-added'), 300); });
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find((product) => product.name === item.name);
  if (existing) existing.quantity += 1; else cart.push({ ...item, quantity: 1 });
  saveCart(cart);
  updateCartCount();
}

let activeCategory = 'all';

function renderProducts(products) {
  const filtered = products.filter(p => activeCategory === 'all' || p.category === activeCategory);
  const html = filtered.map((product, index) => {
    const motionClass = product.motion === 'float' ? 'card--float' : '';
    return `
    <div class="card ${motionClass} card--${product.layout || 'square'}" data-index="${index}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}" data-category="${product.category}">
      <img src="${product.image}" alt="${product.name}">
      <div class="card-content">
        <h3>${product.name}</h3>
        <p class="price">R$${product.price.toFixed(2).replace('.', ',')}</p>
        <p>${product.description}</p>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="add-cart">Adicionar ao carrinho</button>
          <button class="details-btn secondary-btn">Ver detalhes</button>
        </div>
      </div>
    </div>`;
  }).join('');
  productGrid.innerHTML = html;
}

function filterProducts() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { renderProducts(getProducts()); return; }
  const products = getProducts().filter(p => p.name.toLowerCase().includes(q));
  renderProducts(products);
}

function renderCategoryButtons() {
  if (!categoryFilters) return;
  const products = getProducts();
  const cats = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  const container = categoryFilters;
  container.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn active';
  allBtn.dataset.cat = 'all';
  allBtn.textContent = 'Todos';
  container.appendChild(allBtn);
  allBtn.addEventListener('click', () => { setActiveFilter(allBtn); });
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.cat = cat;
    btn.textContent = cat;
    btn.addEventListener('click', () => { setActiveFilter(btn); });
    container.appendChild(btn);
  });
}

function setActiveFilter(btn) {
  const buttons = categoryFilters.querySelectorAll('.filter-btn');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = btn.dataset.cat === 'all' ? 'all' : btn.dataset.cat;
  renderProducts(getProducts());
}

// Event bindings
categoriesButton && categoriesButton.addEventListener('click', () => categoryMenu.classList.toggle('open'));
document.addEventListener('click', (event) => { if (!event.target.closest('.header-left')) categoryMenu.classList.remove('open'); if (!event.target.closest('.user-avatar') && !event.target.closest('.user-menu')) userMenu.classList.remove('open'); });
userAvatar && userAvatar.addEventListener('click', () => userMenu.classList.toggle('open'));

searchButton && searchButton.addEventListener('click', filterProducts);
searchInput && searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') filterProducts(); });

productGrid && productGrid.addEventListener('click', (event) => {
  const detailsBtn = event.target.closest('.details-btn');
  if (detailsBtn) {
    const card = detailsBtn.closest('.card');
    const idx = Number(card.dataset.index);
    const products = getProducts();
    const product = products[idx];
    if (product) openProductModal(product);
    return;
  }

  const addBtn = event.target.closest('.add-cart');
  if (!addBtn) return;
  const button = addBtn;
  const card = button.closest('.card');
  const name = card.dataset.name;
  const price = parseFloat(card.dataset.price);
  const image = card.dataset.image;
  const imgElement = card.querySelector('img');
  addToCart({ name, price, image });
  animateToCart(imgElement);
});

// Modal controls
function openProductModal(product) {
  if (!productModal) return;
  modalImage.src = product.image || product.img || '';
  modalImage.alt = product.name || '';
  modalName.textContent = product.name || '';
  modalPrice.textContent = `R$${(Number(product.price) || 0).toFixed(2).replace('.', ',')}`;
  modalDescription.textContent = product.description || '';
  productModal.setAttribute('aria-hidden', 'false');
  productModal.classList.add('open');
  // wire add to cart inside modal
  modalAddCart.onclick = () => {
    addToCart({ name: product.name, price: Number(product.price) || 0, image: product.image || product.img || '' });
    animateToCart(modalImage);
    closeProductModal();
  };
}

function closeProductModal() {
  if (!productModal) return;
  productModal.setAttribute('aria-hidden', 'true');
  productModal.classList.remove('open');
  modalAddCart.onclick = null;
}

// close when clicking overlay or buttons with data-close
document.addEventListener('click', (e) => {
  if (!productModal) return;
  const closeTrigger = e.target.closest('[data-close]');
  if (closeTrigger && productModal.classList.contains('open')) closeProductModal();
});

// ESC to close
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProductModal(); });

cartButton && cartButton.addEventListener('click', () => window.location.href = 'cart.html');

async function initializePage() {
  // Try server sync first so visitors see admin updates
  await fetchStoreFromServer();
  const products = getProducts();
  renderCategoryButtons();
  renderProducts(products);
  updateCartCount();
}

initializePage();

// Periodically poll server for updates so visitors see admin changes without reload
setInterval(async () => {
  const before = localStorage.getItem(PRODUCTS_KEY) || '';
  const store = await fetchStoreFromServer();
  const after = localStorage.getItem(PRODUCTS_KEY) || '';
  if (store && before !== after) {
    renderCategoryButtons();
    renderProducts(getProducts());
    updateCartCount();
  }
}, 15_000);

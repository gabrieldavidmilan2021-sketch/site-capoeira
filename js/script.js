// ============================================
// LOJA ELEGANTE — Main Script
// ============================================

/* Default Data */
const defaultFeatured = [
  { id: 'f1', name: 'Camiseta Roda de Ouro', price: 129.9, oldPrice: 169.9, colors: ['#d7a93d','#123a2b','#f5e7bf'], img: 'https://via.placeholder.com/640x800?text=Camiseta+Roda', description: 'Camiseta leve para treinos e momentos de roda, com conforto para acompanhar sua ginga.', motion: 'float' },
  { id: 'f2', name: 'Boné Mestre do Terreiro', price: 99.9, oldPrice: 129.9, colors: ['#123a2b','#d7a93d','#7d2b1b'], img: 'https://via.placeholder.com/640x800?text=Bone+Mestre', description: 'Boné ajustável para proteger do sol e levar a cultura da capoeira no dia a dia.', motion: 'static' },
  { id: 'f3', name: 'Moletom da Capoeira', price: 89.9, oldPrice: 109.9, colors: ['#d7a93d','#7d2b1b'], img: 'https://via.placeholder.com/640x800?text=Moletom+Capoeira', description: 'Moletom confortável para os dias frios, com liberdade para se movimentar.', motion: 'float' },
  { id: 'f4', name: 'Toca de Guerreiro', price: 179.9, oldPrice: 219.9, colors: ['#1f5a43','#f4e7c5'], img: 'https://via.placeholder.com/640x800?text=Toca+Guerreiro', description: 'Peça resistente feita para acompanhar o treino, o jogo e a vida na roda.', motion: 'static' },
  { id: 'f5', name: 'Camiseta Cordel Verde', price: 119.9, oldPrice: 139.9, colors: ['#1f5a43','#7d2b1b'], img: 'https://via.placeholder.com/640x800?text=Camiseta+Cordel', description: 'Camiseta com inspiração na tradição da capoeira e caimento confortável.', motion: 'float' }
];

const defaultBest = [
  { id: 'b1', name: 'Berimbau de Lona', price: 159.9, oldPrice: 199.9, colors: ['#123a2b','#d7a93d'], img: 'https://via.placeholder.com/640x800?text=Berimbau', description: 'Instrumento essencial para conduzir o ritmo e a energia da roda de capoeira.' },
  { id: 'b2', name: 'Camiseta Angola', price: 49.9, oldPrice: 69.9, colors: ['#d7a93d','#123a2b'], img: 'https://via.placeholder.com/640x800?text=Camiseta+Angola', description: 'Camiseta prática para treino, passeio e encontros da comunidade capoeirista.' },
  { id: 'b3', name: 'Bola de Capoeira', price: 89.9, oldPrice: 119.9, colors: ['#f5e7bf','#7d2b1b'], img: 'https://via.placeholder.com/640x800?text=Bola+Capoeira', description: 'Acessório para complementar sua prática e rotina de atividades.' },
  { id: 'b4', name: 'Mochila da Roda', price: 219.9, oldPrice: 259.9, colors: ['#7d2b1b','#f5e7bf'], img: 'https://via.placeholder.com/640x800?text=Mochila+Roda', description: 'Mochila espaçosa para transportar uniforme, corda e itens de treino.' },
  { id: 'b5', name: 'Kit de Acessórios', price: 99.9, oldPrice: 129.9, colors: ['#1f5a43','#d7a93d'], img: 'https://via.placeholder.com/640x800?text=Kit+Acessorios', description: 'Kit selecionado para acompanhar sua caminhada na capoeira.' }
];

function getStoredProducts(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    const raw = JSON.parse(stored);
    return Array.isArray(raw) ? raw : fallback;
  } catch {
    return fallback;
  }
}

function normalizeProductImage(value) {
  const img = String(value || '').trim();
  if (!img || img === 'undefined' || img === 'null') {
    return 'https://via.placeholder.com/640x800?text=Produto+Loja';
  }
  return img;
}

const productImageFallback = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="800" viewBox="0 0 640 800"><rect width="640" height="800" fill="#dededb"/><text x="50%" y="50%" fill="#30302e" font-family="Arial" font-size="28" text-anchor="middle">Imagem indisponível</text></svg>');

function normalizeProductName(value) {
  const name = String(value || '').trim();
  return name || 'Produto da Loja';
}

function normalizeProductPrice(value, fallback = 0) {
  const number = Number(value ?? fallback);
  return Number.isFinite(number) ? number : fallback;
}

// Load from localStorage or use defaults
let featuredProducts = getStoredProducts('featuredProducts', defaultFeatured).map(normalizeProduct);
let bestSellers = getStoredProducts('bestSellers', defaultBest).map(normalizeProduct);
let lastServerStore = '';

// Ensure products have all required fields
function normalizeProduct(p = {}) {
  const qty = Number(p.qty ?? p.quantity ?? 10);
  const price = normalizeProductPrice(p.price, 0);
  const oldPrice = normalizeProductPrice(p.oldPrice, price ? price * 1.3 : 0);
  const images = (Array.isArray(p.images) ? p.images : [p.img || p.image])
    .map(normalizeProductImage)
    .filter((image, index, values) => image && values.indexOf(image) === index)
    .slice(0, 2);

  return {
    id: p.id || `p${Date.now()}`,
    name: normalizeProductName(p.name),
    price,
    oldPrice,
    img: images[0] || normalizeProductImage(''),
    images: images.length ? images : [normalizeProductImage('')],
    category: p.category || '',
    description: p.description || '',
    sizes: p.sizes || '',
    motion: p.motion || 'static',
    colors: Array.isArray(p.colors) && p.colors.length ? p.colors : ['#f8c8d8', '#2b2b2b', '#ffdfe9'],
    qty: Number.isFinite(qty) ? qty : 0
  };
}

function getAllCatalogProducts() {
  try {
    const catalog = JSON.parse(localStorage.getItem('lojaProducts') || '[]');
    const merged = [...featuredProducts, ...bestSellers, ...catalog].map(normalizeProduct);
    const unique = new Map();
    merged.forEach(product => unique.set(product.id, product));
    return Array.from(unique.values());
  } catch {
    const merged = [...featuredProducts, ...bestSellers].map(normalizeProduct);
    return merged;
  }
}

const categories = [
  { id:'c1', name:'Camisetas', img: 'https://via.placeholder.com/200?text=Camisetas' },
  { id:'c2', name:'Bonés', img: 'https://via.placeholder.com/200?text=Bonés' },
  { id:'c3', name:'Cordas', img: 'https://via.placeholder.com/200?text=Cordas' },
  { id:'c4', name:'Calças', img: 'https://via.placeholder.com/200?text=Calças' },
  { id:'c5', name:'Acessórios', img: 'https://via.placeholder.com/200?text=Acessórios' },
  { id:'c6', name:'Mochilas', img: 'https://via.placeholder.com/200?text=Mochilas' },
  { id:'c7', name:'Bolsas', img: 'https://via.placeholder.com/200?text=Bolsas' },
  { id:'c8', name:'Berimbau', img: 'https://via.placeholder.com/200?text=Berimbau' }
];

/* Filters */
let currentCategory = null;
let currentQuery = '';

/* Utils */
function $(sel){
  return document.querySelector(sel);
}

function $all(sel){
  return Array.from(document.querySelectorAll(sel));
}

function readStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ====== RENDER FUNCTIONS ====== */
function renderCategories(){
  const row = $('#categoriesRow');
  if(!row) return;
  
  row.innerHTML = categories.map(cat => `
    <div class="cat" data-cat="${cat.name}" title="${cat.name}">
      <div class="thumb">
        <img data-src="${cat.img}" alt="${cat.name}" loading="lazy" decoding="async">
      </div>
      <p>${cat.name}</p>
    </div>
  `).join('');
}

function productCardHTML(p){
  const safeProduct = normalizeProduct(p);
  const isOutOfStock = Number(safeProduct.qty) <= 0;
  const sizes = Array.isArray(safeProduct.sizes) ? safeProduct.sizes : String(safeProduct.sizes || '').split(',').map(size => size.trim()).filter(Boolean);
  const imageMarkup = safeProduct.images.map((image, index) => `<img class="product-card-image image-loading ${index === 0 ? 'is-primary' : ''}" data-src="${escapeProductText(image)}" alt="${escapeProductText(safeProduct.name)} - foto ${index + 1}" loading="${index === 0 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'low'}" decoding="async" onerror="this.onerror=null;this.src='${productImageFallback}';this.removeAttribute('data-src');this.classList.remove('image-loading')">`).join('');
  return `
    <article class="card fade-up ${safeProduct.motion==='float' ? 'card--float' : ''}" data-id="${safeProduct.id}" data-qty="${safeProduct.qty ?? 0}">
      <div class="media product-card-gallery ${safeProduct.images.length > 1 ? 'has-secondary' : ''}">
        ${imageMarkup}
        <button class="heart" aria-label="Favoritar" type="button">♡</button>
      </div>
      <div class="info">
        <h3 class="title">${safeProduct.name}</h3>
        <div class="prices">
          <del>R$${safeProduct.oldPrice?.toFixed(2).replace('.',',')||''}</del>
          <div class="price-now">R$${safeProduct.price.toFixed(2).replace('.',',')}</div>
        </div>
        <div class="stock-label">${isOutOfStock ? 'Esgotado' : `Estoque: ${safeProduct.qty}`}</div>
        ${sizes.length ? `<label class="size-picker"><span>Tamanho</span><select class="product-size" aria-label="Escolha o tamanho"><option value="">Escolha</option>${sizes.map(size => `<option value="${escapeProductText(size)}">${escapeProductText(size)}</option>`).join('')}</select></label>` : ''}
        <button class="details-btn" type="button">VER DETALHES</button>
        <button class="buy-btn" type="button" ${isOutOfStock ? 'disabled' : ''}>${isOutOfStock ? 'ESGOTADO' : 'COMPRAR'}</button>
      </div>
    </article>
  `;
}

function escapeProductText(value) {
  return String(value || '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function formatPrice(value) {
  const n = Number(value) || 0;
  return `R$${n.toFixed(2).replace('.', ',')}`;
}

async function loadStoreFromServer() {
  try {
    const response = await fetch('/api/store', { cache: 'no-store' });
    if (!response.ok) return;
    const store = await response.json();
    const serverStore = JSON.stringify(store);
    if (serverStore === lastServerStore) return;
    lastServerStore = serverStore;
    if (Array.isArray(store.featuredProducts)) {
      const localFeatured = readStorage('featuredProducts', []);
      if (store.featuredProducts.length || !localFeatured.length) {
        writeStorage('featuredProducts', store.featuredProducts);
        featuredProducts = store.featuredProducts.map(normalizeProduct);
      }
    }
    if (Array.isArray(store.bestSellers)) {
      const localBest = readStorage('bestSellers', []);
      if (store.bestSellers.length || !localBest.length) {
        writeStorage('bestSellers', store.bestSellers);
        bestSellers = store.bestSellers.map(normalizeProduct);
      }
    }
    if (Array.isArray(store.lojaProducts)) writeStorage('lojaProducts', store.lojaProducts);
    if (Array.isArray(store.categorySectionImages)) writeStorage('categorySectionImages', store.categorySectionImages);
    renderFeatured();
    renderBest();
    applyCategorySectionImages();
    lazyLoadImages();
  } catch {
    // Sem servidor, mantém a loja funcionando com os dados locais.
  }
}

function openProductDetails(product) {
  const staticModal = document.getElementById('productModal');
  if (staticModal) {
    const normalizedProduct = normalizeProduct(product);
    const imgEl = document.getElementById('modalImage');
    const secondaryImgEl = document.getElementById('modalImageSecondary');
    const nameEl = document.getElementById('modalName');
    const priceEl = document.getElementById('modalPrice');
    const descEl = document.getElementById('modalDescription');
    const addBtn = document.getElementById('modalAddCart');
    const modalSize = document.getElementById('modalSize');
    const modalSizes = Array.isArray(normalizedProduct.sizes) ? normalizedProduct.sizes : String(normalizedProduct.sizes || '').split(',').map(size => size.trim()).filter(Boolean);

    if (imgEl) { imgEl.src = normalizedProduct.images[0]; imgEl.alt = product.name || ''; }
    if (secondaryImgEl) {
      secondaryImgEl.src = normalizedProduct.images[1] || '';
      secondaryImgEl.hidden = !normalizedProduct.images[1];
      secondaryImgEl.parentElement.classList.toggle('single', !normalizedProduct.images[1]);
    }
    if (nameEl) nameEl.textContent = product.name || '';
    if (priceEl) priceEl.textContent = formatPrice(product.price || 0);
    if (descEl) descEl.textContent = product.description || '';
    if (modalSize) {
      modalSize.innerHTML = modalSizes.length
        ? `<option value="">Escolha o tamanho</option>${modalSizes.map(size => `<option value="${escapeProductText(size)}">${escapeProductText(size)}</option>`).join('')}`
        : '<option value="">Tamanho único</option>';
      modalSize.parentElement.hidden = !modalSizes.length;
      modalSize.value = '';
    }

    staticModal.setAttribute('aria-hidden', 'false');
    staticModal.classList.add('open');

    // close handlers
    staticModal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', () => {
        staticModal.setAttribute('aria-hidden', 'true');
        staticModal.classList.remove('open');
      });
    });

    // add to cart in modal
    if (addBtn) {
      const handler = () => {
        const selectedSize = modalSize?.value || '';
        if (modalSizes.length && !selectedSize) {
          alert('Escolha um tamanho antes de adicionar ao carrinho.');
          return;
        }
        addProductToCart(normalizedProduct, null, selectedSize);
        staticModal.setAttribute('aria-hidden', 'true');
        staticModal.classList.remove('open');
        addBtn.removeEventListener('click', handler);
      };
      addBtn.addEventListener('click', handler);
    }

    return;
  }

  // fallback: original dynamic modal creation
  let modal = document.getElementById('productDetailsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'productDetailsModal';
    modal.className = 'product-details-modal hidden';
    modal.innerHTML = '<div class="product-details-content" role="dialog" aria-modal="true" aria-labelledby="productDetailsTitle"><button class="product-details-close" type="button" aria-label="Fechar">×</button><div id="productDetailsBody"></div></div>';
    document.body.appendChild(modal);
    modal.querySelector('.product-details-close').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', event => { if (event.target === modal) modal.classList.add('hidden'); });
  }

  const colors = (product.colors || []).map(color => `<span class="product-details-color" style="background:${color}" title="${color}"></span>`).join('') || '<span>Não informado</span>';
  const sizes = Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes;
  const outOfStock = Number(product.qty || 0) <= 0;
  modal.querySelector('#productDetailsBody').innerHTML = `<img class="product-details-image" src="${escapeProductText(product.img)}" alt="${escapeProductText(product.name)}"><div class="product-details-info"><p class="eyebrow">DETALHES DO PRODUTO</p><h2 id="productDetailsTitle">${escapeProductText(product.name)}</h2><strong class="product-details-price">${formatPrice(product.price)}</strong><p>${escapeProductText(product.description || 'Produto selecionado da nossa coleção.')}</p><div><b>Tamanhos:</b> ${escapeProductText(sizes || 'Consulte a disponibilidade')}</div><div><b>Cores:</b> <span class="product-details-colors">${colors}</span></div><button class="buy-btn product-details-add" type="button" ${outOfStock ? 'disabled' : ''} data-product-id="${escapeProductText(product.id)}">${outOfStock ? 'ESGOTADO' : 'ADICIONAR AO CARRINHO'}</button></div>`;
  const addButton = modal.querySelector('.product-details-add');
  if (addButton) {
    addButton.addEventListener('click', () => {
      if (addProductToCart(product)) modal.classList.add('hidden');
    });
  }
  modal.classList.remove('hidden');
}

function bindProductDetails(container) {
  container.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event => {
      if (event.target.closest('.buy-btn, .heart, .product-size')) return;
      const product = getAllCatalogProducts().find(item => item.id === card.dataset.id);
      if (product) openProductDetails(product);
    });
  });

  // Also open details when clicking the explicit "VER DETALHES" button
  container.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', event => {
      event.stopPropagation();
      const card = btn.closest('.card');
      if (!card) return;
      const product = getAllCatalogProducts().find(item => item.id === card.dataset.id);
      if (product) openProductDetails(product);
    });
  });
}

function revealProductCards(container){
  if(!container) return;

  const cards = container.querySelectorAll('.card.fade-up');
  cards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 60}ms`;
    requestAnimationFrame(() => card.classList.add('visible'));
  });
}

function bindBuyButtons(container){
  if(!container) return;

  const buttons = container.querySelectorAll('.buy-btn');
  buttons.forEach(button => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (button.disabled) return;

      const card = button.closest('.card');
      if (!card) return;

      ripple(button, event);

      const targetProduct = getAllCatalogProducts().find(item => item.id === card.dataset.id);
      const selectedSize = card.querySelector('.product-size')?.value || '';
      const productSizes = Array.isArray(targetProduct?.sizes) ? targetProduct.sizes : String(targetProduct?.sizes || '').split(',').map(size => size.trim()).filter(Boolean);
      if (productSizes.length && !selectedSize) {
        alert('Escolha um tamanho antes de adicionar ao carrinho.');
        return;
      }
      if (addProductToCart(targetProduct, card, selectedSize)) {
        animateProductToCart(card);
      }
    };
  });
}

function addProductToCart(product, sourceCard, size = '') {
  if (!product || Number(product.qty || 0) <= 0) return false;

  const cart = Array.isArray(readStorage('cart', [])) ? readStorage('cart', []) : [];
  const existing = cart.find(item => item.id === product.id && item.size === size);
  const quantityInCart = Number(existing?.qty || 0);

  if (quantityInCart >= Number(product.qty)) {
    alert('Você já adicionou ao carrinho toda a quantidade disponível deste produto.');
    return false;
  }

  if (existing) {
    existing.qty = quantityInCart + 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, size, qty: 1 });
  }

  writeStorage('cart', cart);
  updateCartCount();
  renderFeatured();
  renderBest();
  return true;
}

function renderFeatured(){
  const grid = $('#featuredGrid');
  if(!grid) return;
  const section = grid.closest('section');
  if (section) section.hidden = featuredProducts.length === 0;
  if (!featuredProducts.length) {
    grid.innerHTML = '';
    return;
  }
  
  const list = featuredProducts.filter(p => {
    if(currentCategory && p.name.toLowerCase().indexOf(currentCategory.toLowerCase()) === -1 && (!p.category || p.category.toLowerCase() !== currentCategory.toLowerCase())) return false;
    if(currentQuery && p.name.toLowerCase().indexOf(currentQuery.toLowerCase()) === -1) return false;
    return true;
  });
  
  grid.innerHTML = list.map(productCardHTML).join('');
  bindBuyButtons(grid);
  bindProductDetails(grid);
  revealProductCards(grid);
  const count = $('#featuredCount');
  if(count) count.textContent = list.length;
}

function renderBest(){
  const grid = $('#bestGrid');
  if(!grid) return;
  const section = grid.closest('section');
  if (section) section.hidden = bestSellers.length === 0;
  if (!bestSellers.length) {
    grid.innerHTML = '';
    return;
  }
  
  const list = bestSellers.filter(p => {
    if(currentCategory && p.name.toLowerCase().indexOf(currentCategory.toLowerCase()) === -1 && (!p.category || p.category.toLowerCase() !== currentCategory.toLowerCase())) return false;
    if(currentQuery && p.name.toLowerCase().indexOf(currentQuery.toLowerCase()) === -1) return false;
    return true;
  });
  
  grid.innerHTML = list.map(productCardHTML).join('');
  bindBuyButtons(grid);
  bindProductDetails(grid);
  revealProductCards(grid);
  const count = $('#bestCount');
  if(count) count.textContent = list.length;
}

/* ====== LAZY LOAD ====== */
function lazyLoadImages(){
  const imgs = document.querySelectorAll('img[data-src]');
  imgs.forEach(img => {
    img.addEventListener('load', () => img.classList.remove('image-loading'), { once: true });
  });
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '500px' });
  
  imgs.forEach(img => observer.observe(img));
}

function observeCards(){
  const cards = document.querySelectorAll('.card.fade-up');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  
  cards.forEach(card => observer.observe(card));
}

/* ====== INTERACTIONS ====== */
function setupFavorites(){
  document.addEventListener('click', e => {
    const heart = e.target.closest('.heart');
    if(!heart) return;
    
    heart.classList.toggle('active');
    heart.textContent = heart.classList.contains('active') ? '♥' : '♡';
    
    const card = heart.closest('.card');
    const id = card.dataset.id;
    const favs = JSON.parse(localStorage.getItem('favs')||'[]');
    
    if(heart.classList.contains('active')){
      if(!favs.includes(id)) favs.push(id);
    } else {
      const i = favs.indexOf(id);
      if(i > -1) favs.splice(i, 1);
    }
    
    localStorage.setItem('favs', JSON.stringify(favs));
  });
}

function setupProductDetails(){
  document.addEventListener('click', event => {
    const card = event.target.closest('.product-grid .card');
    if (!card || event.target.closest('button, a')) return;

    const product = getAllCatalogProducts().find(item => item.id === card.dataset.id);
    if (product) openProductDetails(product);
  });
}

function animateProductToCart(card){
  const cartButton = document.getElementById('cartButton');
  if(!cartButton || !card) return;

  const clone = card.cloneNode(true);
  const fromRect = card.getBoundingClientRect();
  const toRect = cartButton.getBoundingClientRect();

  clone.classList.add('product-fly-clone');
  clone.style.width = `${fromRect.width}px`;
  clone.style.height = `${fromRect.height}px`;
  clone.style.left = `${fromRect.left}px`;
  clone.style.top = `${fromRect.top}px`;
  clone.style.position = 'fixed';
  clone.style.zIndex = '9999';
  clone.style.pointerEvents = 'none';
  document.body.appendChild(clone);

  const offsetX = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
  const offsetY = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);

  requestAnimationFrame(() => {
    clone.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0.12)`;
    clone.style.opacity = '0.2';
    clone.style.filter = 'blur(1px)';
  });

  cartButton.classList.remove('cart-pulse');
  void cartButton.offsetWidth;
  cartButton.classList.add('cart-pulse');

  setTimeout(() => clone.remove(), 760);
}

function setupBuyButtons(){
  bindBuyButtons(document);
}

function ripple(elem, event){
  const rect = elem.getBoundingClientRect();
  const dot = document.createElement('span');
  dot.style.position = 'absolute';
  dot.style.borderRadius = '50%';
  dot.style.pointerEvents = 'none';
  
  const size = Math.max(rect.width, rect.height) * 1.2;
  dot.style.width = dot.style.height = size + 'px';
  dot.style.left = (event.clientX - rect.left - size/2) + 'px';
  dot.style.top = (event.clientY - rect.top - size/2) + 'px';
  dot.style.background = 'rgba(255,255,255,0.35)';
  dot.style.transform = 'scale(0)';
  dot.style.transition = 'transform .45s ease, opacity .6s ease';
  
  elem.appendChild(dot);
  
  requestAnimationFrame(() => dot.style.transform = 'scale(1)');
  
  setTimeout(() => {
    dot.style.opacity = '0';
  }, 400);
  
  setTimeout(() => {
    dot.remove();
  }, 900);
}

function updateCartCount(){
  const cart = Array.isArray(readStorage('cart', [])) ? readStorage('cart', []) : [];
  const total = cart.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const el = $('#cartCount');
  if(el) el.textContent = total;
}

/* ====== HEADER CONTROLS ====== */
function wireHeaderControls(){
  // Menu toggle
  const catBtn = $('#categoriesButton');
  const catMenu = $('#categoryMenu');
  
  if(catBtn && catMenu){
    catBtn.addEventListener('click', e => {
      e.stopPropagation();
      catMenu.classList.toggle('open');
    });
  }
  
  // Menu items
  document.addEventListener('click', e => {
    if(e.target.closest('.category-item')){
      e.preventDefault();
      const name = e.target.textContent.trim();
      setCategory(name);
      if(catMenu) catMenu.classList.remove('open');
    }
    
    // Close menu when clicking outside
    if(!e.target.closest('.header-left')){
      if(catMenu) catMenu.classList.remove('open');
    }
  });
  
  // Categories circular
  document.addEventListener('click', e => {
    const c = e.target.closest('.cat');
    if(c){
      const name = c.dataset.cat;
      if(name){
        if(currentCategory === name){
          setCategory(null);
        } else {
          setCategory(name);
        }
      }
    }
  });
  
  // Search
  const sbtn = $('#searchButton');
  const sinp = $('#searchInput');
  
  if(sbtn && sinp){
    sbtn.addEventListener('click', () => {
      setQuery(sinp.value.trim());
    });
  }
  
  if(sinp){
    sinp.addEventListener('keyup', e => {
      if(e.key === 'Enter') setQuery(sinp.value.trim());
    });
  }
  
  // Cart button
  const cartBtn = $('#cartButton');
  if(cartBtn){
    cartBtn.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  }
}

function setCategory(cat){
  if(!cat) currentCategory = null;
  else currentCategory = cat;
  
  renderFeatured();
  renderBest();
  lazyLoadImages();
  observeCards();
}

function setQuery(q){
  currentQuery = q;
  renderFeatured();
  renderBest();
  lazyLoadImages();
  observeCards();
}

/* ====== BACK TO TOP ====== */
function setupBackTop(){
  const bt = $('#backTop');
  if(!bt) return;
  
  window.addEventListener('scroll', () => {
    if(window.scrollY > 300){
      bt.classList.add('show');
    } else {
      bt.classList.remove('show');
    }
  });
  
  bt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ====== INIT ====== */
function init(){
  registerSiteVisit();
  moveArtsSectionToCollectionSpot();
  applyCategorySectionImages();
  renderCategories();
  renderFeatured();
  renderBest();
  
  lazyLoadImages();
  observeCards();
  setupFavorites();
  setupBuyButtons();
  updateCartCount();
  setupBackTop();
  wireHeaderControls();
  loadStoreFromServer();
  setInterval(loadStoreFromServer, 2000);
  
  // Re-run lazy load after delay
  setTimeout(lazyLoadImages, 600);
}

function registerSiteVisit(){
  if (window.location.pathname.endsWith('/admin.html')) return;
  fetch('/api/visit', { method: 'POST', cache: 'no-store' }).catch(() => {
    // A vitrine continua funcionando quando o servidor de métricas está indisponível.
  });
}

function moveArtsSectionToCollectionSpot() {
  const collectionBanner = document.getElementById('colecao');
  const artsSection = Array.from(document.querySelectorAll('section.section.container')).find(section => {
    const title = section.querySelector('.section-head h2');
    return title && title.textContent.trim() === 'ARTES';
  });

  if (collectionBanner && artsSection) {
    collectionBanner.replaceWith(artsSection);
  }
}

function applyCategorySectionImages() {
  try {
    const images = JSON.parse(localStorage.getItem('categorySectionImages') || '[]');
    if (!Array.isArray(images) || !images.length) return;

    document.querySelectorAll('.lookbook-grid .lookbook-item img').forEach((image, index) => {
      if (images[index]) image.src = images[index];
    });
  } catch {
    // Mantém as imagens padrão se não houver imagens personalizadas.
  }
}

// Atualiza a vitrine se o administrador alterar produtos em outra aba.
window.addEventListener('storage', event => {
  if (event.key !== 'featuredProducts' && event.key !== 'bestSellers') return;

  featuredProducts = getStoredProducts('featuredProducts', defaultFeatured).map(normalizeProduct);
  bestSellers = getStoredProducts('bestSellers', defaultBest).map(normalizeProduct);
  renderFeatured();
  renderBest();
  lazyLoadImages();
  observeCards();
});

// Run on DOM ready
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

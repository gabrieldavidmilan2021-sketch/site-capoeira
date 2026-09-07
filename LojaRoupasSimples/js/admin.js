// ============================================
// LOJA ELEGANTE — Admin Script
// ============================================

const ADMIN_USER = 'mariana';
const ADMIN_PASS = '812799Ma@';
const FEATURED_KEY = 'featuredProducts';
const BEST_KEY = 'bestSellers';
const PRODUCTS_KEY = 'lojaProducts';

// Os mesmos cards exibidos inicialmente na vitrine pública.
const DEFAULT_PRODUCTS = [
  { id: 'f1', name: 'Vestido Longo Floral', price: 129.9, oldPrice: 169.9, colors: ['#f8c8d8', '#2b2b2b', '#ffdfe9'], img: 'https://via.placeholder.com/640x800?text=Vestido+Longo', motion: 'float' },
  { id: 'f2', name: 'Blusa de Seda Rosa', price: 99.9, oldPrice: 129.9, colors: ['#ffdfe9', '#d9a5b6', '#2b2b2b'], img: 'https://via.placeholder.com/640x800?text=Blusa+de+Seda', motion: 'static' },
  { id: 'f3', name: 'Saia Midi Plissada', price: 89.9, oldPrice: 109.9, colors: ['#f5d0d9', '#a86c80'], img: 'https://via.placeholder.com/640x800?text=Saia+Midi', motion: 'float' },
  { id: 'f4', name: 'Conjunto Linho', price: 179.9, oldPrice: 219.9, colors: ['#eae0df', '#c49aa8'], img: 'https://via.placeholder.com/640x800?text=Conjunto+Linho', motion: 'static' },
  { id: 'f5', name: 'Vestido Curto Estampado', price: 119.9, oldPrice: 139.9, colors: ['#ffdfe9', '#6b3b4a'], img: 'https://via.placeholder.com/640x800?text=Vestido+Curto', motion: 'float' },
  { id: 'b1', name: 'Vestido Social Preto', price: 159.9, oldPrice: 199.9, colors: ['#000', '#7a6b78'], img: 'https://via.placeholder.com/640x800?text=Vestido+Social', motion: 'static' },
  { id: 'b2', name: 'Top Cropped Casual', price: 49.9, oldPrice: 69.9, colors: ['#ffdfe9', '#2b2b2b'], img: 'https://via.placeholder.com/640x800?text=Top+Cropped', motion: 'static' },
  { id: 'b3', name: 'Bolsa de Mão Rosa', price: 89.9, oldPrice: 119.9, colors: ['#ffb6c1', '#d96f86'], img: 'https://via.placeholder.com/640x800?text=Bolsa+Rosa', motion: 'static' },
  { id: 'b4', name: 'Casaco Oversized', price: 219.9, oldPrice: 259.9, colors: ['#45303b', '#e8d9df'], img: 'https://via.placeholder.com/640x800?text=Casaco+Oversized', motion: 'static' },
  { id: 'b5', name: 'Conjunto Fitness', price: 99.9, oldPrice: 129.9, colors: ['#dcd6de', '#a57a88'], img: 'https://via.placeholder.com/640x800?text=Conjunto+Fitness', motion: 'static' }
];

// Sample images for gallery
const sampleImages = [
  'https://via.placeholder.com/640x800?text=Vestido+Colorido',
  'https://via.placeholder.com/640x800?text=Top+Estiloso',
  'https://via.placeholder.com/640x800?text=Look+Chique',
  'https://via.placeholder.com/640x800?text=Roupa+Casual',
  'https://via.placeholder.com/640x800?text=Conjunto+Moderno',
  'https://via.placeholder.com/640x800?text=Blusa+Premium',
  'https://via.placeholder.com/640x800?text=Saia+Elegante',
  'https://via.placeholder.com/640x800?text=Macacão+Chic'
];

// DOM Elements
const loginSection = document.getElementById('loginSection');
const manageSection = document.getElementById('manageSection');
const adminUser = document.getElementById('adminUser');
const adminPass = document.getElementById('adminPass');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const adminGrid = document.getElementById('adminGrid');
const addProductBtn = document.getElementById('addProductBtn');
const featuredTabBtn = document.getElementById('featuredTabBtn');
const bestTabBtn = document.getElementById('bestTabBtn');
const saveProductBtn = document.getElementById('saveProductBtn');
const deleteProductBtn = document.getElementById('deleteProductBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const productIndex = document.getElementById('productIndex');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productOldPrice = document.getElementById('productOldPrice');
const productQty = document.getElementById('productQty');
const productImage = document.getElementById('productImage');
const productImageFile = document.getElementById('productImageFile');
const productDescription = document.getElementById('productDescription');
const productSizes = document.getElementById('productSizes');
const productColors = document.getElementById('productColors');
const productCategory = document.getElementById('productCategory');
const productMotion = document.getElementById('productMotion');
const imageGallery = document.getElementById('imageGallery');
const categoriesButton = document.getElementById('categoriesButton');
const categoryMenu = document.getElementById('categoryMenu');
const userAvatar = document.getElementById('userAvatar');
const categorySectionImageInputs = document.querySelectorAll('[data-section-image-index]');
const categorySectionPreview = document.getElementById('categorySectionPreview');
const CATEGORY_SECTION_IMAGES_KEY = 'categorySectionImages';

let activeAdminSection = 'featured';

function getStorePayload() {
  const readList = key => {
    try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; }
    catch { return []; }
  };
  return {
    featuredProducts: readList(FEATURED_KEY),
    bestSellers: readList(BEST_KEY),
    lojaProducts: readList(PRODUCTS_KEY),
    categorySectionImages: readList(CATEGORY_SECTION_IMAGES_KEY)
  };
}

async function syncStoreOnline() {
  try {
    await fetch('/api/store', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(getStorePayload()) });
  } catch {
    // A loja continua utilizável localmente se o servidor estiver indisponível.
  }
}

// Utils
function $(sel) {
  return document.querySelector(sel);
}

function formatPrice(value) {
  return `R$${value.toFixed(2).replace('.', ',')}`;
}

function normalizeProductRecord(product = {}) {
  const qty = Number(product.qty ?? product.quantity ?? 0);
  return {
    id: product.id || `p${Date.now()}`,
    name: product.name || 'Novo Produto',
    price: Number(product.price) || 0,
    oldPrice: Number(product.oldPrice ?? product.price * 1.3 ?? 0),
    img: product.img || product.image || '',
    description: product.description || '',
    sizes: product.sizes || '',
    category: product.category || '',
    motion: product.motion || 'static',
    colors: Array.isArray(product.colors) && product.colors.length ? product.colors : ['#f8c8d8', '#2b2b2b', '#ffdfe9'],
    qty: Number.isFinite(qty) ? qty : 0
  };
}

function getSectionProducts(section = activeAdminSection) {
  const featuredStored = localStorage.getItem(FEATURED_KEY);
  const bestStored = localStorage.getItem(BEST_KEY);
  const featured = JSON.parse(featuredStored || '[]');
  const best = JSON.parse(bestStored || '[]');

  if (section === 'best') {
    if (bestStored !== null && Array.isArray(best)) return best.map(normalizeProductRecord);
    return DEFAULT_PRODUCTS.filter(product => product.id.startsWith('b')).map(normalizeProductRecord);
  }

  if (featuredStored !== null && Array.isArray(featured)) return featured.map(normalizeProductRecord);
  return DEFAULT_PRODUCTS.filter(product => product.id.startsWith('f')).map(normalizeProductRecord);
}

// Get all products
function getAllProducts() {
  return [...getSectionProducts('featured'), ...getSectionProducts('best')];
}

function saveSectionProducts(section, products) {
  const normalized = products.map(normalizeProductRecord);

  if (section === 'best') {
    localStorage.setItem(BEST_KEY, JSON.stringify(normalized));
    syncStoreOnline();
    return;
  }

  localStorage.setItem(FEATURED_KEY, JSON.stringify(normalized));
  syncStoreOnline();
}

// Save products back to storage
function saveAllProducts(allProducts = []) {
  const normalized = allProducts.map(normalizeProductRecord);

  const featured = normalized.filter(product => product.id.startsWith('f'));
  const best = normalized.filter(product => product.id.startsWith('b'));

  localStorage.setItem(FEATURED_KEY, JSON.stringify(featured));
  localStorage.setItem(BEST_KEY, JSON.stringify(best));
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(normalized.map(product => ({
    ...product,
    image: product.img,
    description: product.description || ''
  }))));
  syncStoreOnline();
}

// Set admin mode
function setAdminMode(isAdmin) {
  sessionStorage.setItem('adminLogged', isAdmin ? 'true' : 'false');
  loginSection.classList.toggle('hidden', isAdmin);
  manageSection.classList.toggle('hidden', !isAdmin);
  
  if (isAdmin) {
    adminUser.value = '';
    adminPass.value = '';
    loadAdminProducts();
    renderImageGallery();
  }
}

// Show message
function showMessage(msg) {
  alert(msg);
}

// Clear form
function clearForm() {
  productIndex.value = '';
  productName.value = '';
  productPrice.value = '';
  productOldPrice.value = '';
  productQty.value = '1';
  productImage.value = '';
  productImageFile.value = '';
  productDescription.value = '';
  productSizes.value = '';
  productColors.value = '';
  productCategory.value = '';
  productMotion.value = 'static';
  deleteProductBtn.style.display = 'none';
  imageGallery.querySelectorAll('.image-thumb').forEach(thumb => thumb.classList.remove('selected'));
}

function handleImageSelection(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = event => {
    const result = event.target.result;
    productImage.value = result;

    const galleryThumbs = imageGallery.querySelectorAll('.image-thumb');
    galleryThumbs.forEach(thumb => thumb.classList.remove('selected'));

    const localThumb = document.createElement('div');
    localThumb.className = 'image-thumb selected';
    localThumb.innerHTML = `<img src="${result}" alt="Imagem selecionada" loading="lazy">`;
    imageGallery.prepend(localThumb);
  };

  reader.readAsDataURL(file);
}

function normalizeImageSource(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^data:image\//i.test(text) || /^https?:\/\//i.test(text) || /^\/\//.test(text)) {
    return text;
  }
  return text;
}

function getCategorySectionImages() {
  try {
    const images = JSON.parse(localStorage.getItem(CATEGORY_SECTION_IMAGES_KEY) || '[]');
    return Array.isArray(images) ? images : [];
  } catch {
    return [];
  }
}

function renderCategorySectionPreview() {
  if (!categorySectionPreview) return;
  const images = getCategorySectionImages();
  categorySectionPreview.innerHTML = Array.from({ length: 6 }, (_, index) => {
    const src = images[index];
    return src
      ? `<div class="image-thumb"><img src="${src}" alt="Imagem personalizada do card ${index + 1}" loading="lazy"></div>`
      : `<div class="image-thumb section-image-placeholder">Card ${index + 1}<br>Sem imagem</div>`;
  }).join('');
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Falha ao ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

// Render image gallery
function renderImageGallery() {
  imageGallery.innerHTML = sampleImages.map(src => `
    <div class="image-thumb" data-src="${src}">
      <img src="${src}" alt="Galeria" loading="lazy">
    </div>
  `).join('');
  
  imageGallery.querySelectorAll('.image-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      imageGallery.querySelectorAll('.image-thumb').forEach(t => t.classList.remove('selected'));
      thumb.classList.add('selected');
      productImage.value = thumb.dataset.src;
    });
  });
}

function setAdminSection(section) {
  activeAdminSection = section;
  featuredTabBtn.classList.toggle('save', section === 'featured');
  featuredTabBtn.classList.toggle('cancel', section !== 'featured');
  bestTabBtn.classList.toggle('save', section === 'best');
  bestTabBtn.classList.toggle('cancel', section !== 'best');
  renderAdminProducts();
}

// Render admin grid
function renderAdminProducts(section = activeAdminSection) {
  const products = getSectionProducts(section);

  if (products.length === 0) {
    adminGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:40px 20px;">Nenhum produto nesta seção. Adicione um novo!</p>';
    return;
  }

  adminGrid.innerHTML = products.map((product, index) => `
    <div class="admin-card">
      <img src="${product.img}" alt="${product.name}" loading="lazy">
      <div class="admin-card-body">
        <h3>${product.name}</h3>
        <p style="color:var(--accent);font-weight:700;margin:4px 0;">${formatPrice(product.price)}</p>
        <p style="font-size:0.85rem;color:#666;margin:8px 0;">
          Estoque: <strong>${product.qty ?? 0}</strong>
        </p>
        <p style="font-size:0.85rem;color:#999;margin:8px 0;">
          ${product.category || 'Sem categoria'} ${product.motion === 'float' ? '(Flutuante)' : ''}
        </p>
        <button class="edit-btn" data-index="${index}" type="button">Editar</button>
      </div>
    </div>
  `).join('');

  adminGrid.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      loadProductToForm(Number(btn.dataset.index), section);
    });
  });
}

// Load product to form
function loadProductToForm(index, section = activeAdminSection) {
  const products = getSectionProducts(section);
  const product = products[index];

  if (!product) return;

  activeAdminSection = section;
  productIndex.value = index;
  productName.value = product.name || '';
  productPrice.value = product.price || '';
  productOldPrice.value = product.oldPrice || '';
  productQty.value = product.qty ?? 1;
  productImage.value = product.img || '';
  productDescription.value = product.description || '';
  productSizes.value = Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes || '');
  productColors.value = Array.isArray(product.colors) ? product.colors.join(', ') : '';
  productCategory.value = product.category || '';
  productMotion.value = product.motion || 'static';

  // Highlight selected image
  imageGallery.querySelectorAll('.image-thumb').forEach(thumb => {
    thumb.classList.toggle('selected', thumb.dataset.src === product.img || thumb.querySelector('img')?.src === product.img);
  });

  deleteProductBtn.style.display = 'inline-block';
  scrollToForm();
}

// Scroll to form
function scrollToForm() {
  document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
}

// Load admin products
function loadAdminProducts() {
  renderAdminProducts();
  clearForm();
}

// Event: Login
loginButton.addEventListener('click', () => {
  const user = adminUser.value.trim();
  const pass = adminPass.value.trim();
  
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    setAdminMode(true);
  } else {
    showMessage('❌ Usuário ou senha incorretos!');
  }
});

// Permite entrar pressionando Enter em qualquer campo do login.
[adminUser, adminPass].forEach(field => {
  field.addEventListener('keydown', event => {
    if (event.key === 'Enter') loginButton.click();
  });
});

// Event: Logout
logoutButton.addEventListener('click', () => {
  if (confirm('Deseja realmente sair?')) {
    setAdminMode(false);
  }
});

// Event: Add product
addProductBtn.addEventListener('click', () => {
  clearForm();
  productIndex.value = '';
  deleteProductBtn.style.display = 'none';
  scrollToForm();
});

// Event: Cancel edit
cancelEditBtn.addEventListener('click', () => {
  clearForm();
});

// Event: Save product
saveProductBtn.addEventListener('click', () => {
  const sectionProducts = getSectionProducts(activeAdminSection);
  const index = productIndex.value !== '' ? Number(productIndex.value) : -1;
  const name = productName.value.trim();
  const price = parseFloat(productPrice.value);
  const oldPrice = productOldPrice.value ? parseFloat(productOldPrice.value) : price * 1.3;
  const qty = Number(productQty.value);
  const img = normalizeImageSource(productImage.value);
  const category = productCategory.value || '';
  const motion = productMotion.value || 'static';
  const description = productDescription.value.trim();
  const sizes = productSizes.value.trim();
  const colors = productColors.value.split(',').map(color => color.trim()).filter(color => /^#[0-9a-f]{3,8}$/i.test(color));

  if (!name) {
    showMessage('⚠️ Digite o nome do produto!');
    return;
  }
  if (isNaN(price) || price <= 0) {
    showMessage('⚠️ Digite um preço válido!');
    return;
  }
  if (!Number.isFinite(qty) || qty < 0) {
    showMessage('⚠️ Informe uma quantidade válida em estoque!');
    return;
  }
  if (!img) {
    showMessage('⚠️ Coloque a URL da imagem ou envie um arquivo do celular!');
    return;
  }

  const previousProduct = index >= 0 ? sectionProducts[index] : null;
  const productData = {
    id: previousProduct?.id || `${activeAdminSection[0]}${Date.now()}`,
    name,
    price,
    oldPrice,
    img,
    category,
    motion,
    description,
    sizes,
    qty,
    colors: colors.length ? colors : (previousProduct?.colors || ['#f8c8d8', '#2b2b2b', '#ffdfe9'])
  };

  const updatedSectionProducts = [...sectionProducts];
  if (index >= 0) {
    updatedSectionProducts[index] = productData;
  } else {
    updatedSectionProducts.push(productData);
  }

  saveSectionProducts(activeAdminSection, updatedSectionProducts);
  renderAdminProducts(activeAdminSection);
  clearForm();
  showMessage('✅ Produto salvo com sucesso!');
});

// Event: Delete product
deleteProductBtn.addEventListener('click', () => {
  const index = productIndex.value !== '' ? Number(productIndex.value) : -1;

  if (index < 0 || !confirm('Tem certeza que deseja deletar este produto?')) {
    return;
  }

  const sectionProducts = getSectionProducts(activeAdminSection);
  const updatedSectionProducts = [...sectionProducts];
  updatedSectionProducts.splice(index, 1);
  saveSectionProducts(activeAdminSection, updatedSectionProducts);
  renderAdminProducts(activeAdminSection);
  clearForm();
  showMessage('✅ Produto deletado com sucesso!');
});

// Categories menu
if (categoriesButton && categoryMenu) {
  categoriesButton.addEventListener('click', e => {
    e.stopPropagation();
    categoryMenu.classList.toggle('open');
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.header-left')) {
      categoryMenu.classList.remove('open');
    }
  });
}

productImageFile.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (file) {
    handleImageSelection(file);
  }
});

categorySectionImageInputs.forEach(input => {
  input.addEventListener('change', async event => {
    const [file] = event.target.files || [];
    if (!file) return;

    try {
      const images = getCategorySectionImages();
      images[Number(input.dataset.sectionImageIndex)] = await readImageFile(file);
      localStorage.setItem(CATEGORY_SECTION_IMAGES_KEY, JSON.stringify(images));
      syncStoreOnline();
      renderCategorySectionPreview();
      showMessage(`Imagem do card ${Number(input.dataset.sectionImageIndex) + 1} atualizada com sucesso!`);
    } catch {
      showMessage('Não foi possível salvar a imagem selecionada.');
    }
  });
});

featuredTabBtn.addEventListener('click', () => setAdminSection('featured'));
bestTabBtn.addEventListener('click', () => setAdminSection('best'));

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderImageGallery();
  renderCategorySectionPreview();
  setAdminSection('featured');
  if (sessionStorage.getItem('adminLogged') === 'true') {
    setAdminMode(true);
  } else {
    setAdminMode(false);
  }
});
// Área do usuário
if (userAvatar) {
  userAvatar.addEventListener('click', () => {
    const logged = sessionStorage.getItem('userLogged');

    if (logged === 'true') {
      alert('👤 Você já está conectado!');
      // aqui pode abrir perfil
    } else {
      window.location.href = "login.html";
    }
  });
}

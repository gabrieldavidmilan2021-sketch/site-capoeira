// ============================================
// LOJA ELEGANTE — Cart Page Script
// ============================================

const CART_KEY = 'cart';
const PIX_KEY = '11996568282'; // Informe aqui a chave PIX que receberá os pagamentos.
const PIX_RECEIVER_NAME = 'Mary Modas';
const PIX_RECEIVER_CITY = 'SAO PAULO';
const WHATSAPP_NUMBER = '5511996568282';

const cartContainer = document.getElementById('cartContainer');
const cartTotal = document.getElementById('cartTotal');
const emptyMessage = document.getElementById('emptyMessage');
const finishButton = document.getElementById('finishButton');
const applyCoupon = document.getElementById('applyCoupon');
const cartSubtitle = document.getElementById('cartSubtitle');
const subtotalEl = document.getElementById('subtotal');
const discountEl = document.getElementById('discount');
const shippingEl = document.getElementById('shipping');
const pixModal = document.getElementById('pixModal');
const pixCode = document.getElementById('pixCode');
const pixTotal = document.getElementById('pixTotal');
const copyPixButton = document.getElementById('copyPixButton');
const closePixModal = document.getElementById('closePixModal');
const confirmPaymentButton = document.getElementById('confirmPaymentButton');

// Product database (same as script.js)
const allProducts = [
  { id: 'f1', name: 'Camiseta Roda de Ouro', price: 129.9, img: 'https://via.placeholder.com/640x800?text=Camiseta+Roda', qty: 10 },
  { id: 'f2', name: 'Boné Mestre do Terreiro', price: 99.9, img: 'https://via.placeholder.com/640x800?text=Bone+Mestre', qty: 10 },
  { id: 'f3', name: 'Moletom da Capoeira', price: 89.9, img: 'https://via.placeholder.com/640x800?text=Moletom+Capoeira', qty: 10 },
  { id: 'f4', name: 'Toca de Guerreiro', price: 179.9, img: 'https://via.placeholder.com/640x800?text=Toca+Guerreiro', qty: 10 },
  { id: 'f5', name: 'Camiseta Cordel Verde', price: 119.9, img: 'https://via.placeholder.com/640x800?text=Camiseta+Cordel', qty: 10 },
  { id: 'b1', name: 'Berimbau de Lona', price: 159.9, img: 'https://via.placeholder.com/640x800?text=Berimbau', qty: 10 },
  { id: 'b2', name: 'Camiseta Angola', price: 49.9, img: 'https://via.placeholder.com/640x800?text=Camiseta+Angola', qty: 10 },
  { id: 'b3', name: 'Bola de Capoeira', price: 89.9, img: 'https://via.placeholder.com/640x800?text=Bola+Capoeira', qty: 10 },
  { id: 'b4', name: 'Mochila da Roda', price: 219.9, img: 'https://via.placeholder.com/640x800?text=Mochila+Roda', qty: 10 },
  { id: 'b5', name: 'Kit de Acessórios', price: 99.9, img: 'https://via.placeholder.com/640x800?text=Kit+Acessorios', qty: 10 }
];

let currentDiscount = 0;
let currentShipping = 0;

function $(sel) {
  return document.querySelector(sel);
}

function formatPrice(value) {
  return `R$${value.toFixed(2).replace('.', ',')}`;
}

function readStorage(key, fallback = []) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    const parsed = JSON.parse(stored);
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

function getCart() {
  const stored = readStorage(CART_KEY, []);
  return Array.isArray(stored) ? stored : [];
}

function calculateShipping(cep) {
  const digits = onlyCep(cep);
  if (digits.length !== 8) return 0;

  const pricesByRegion = { '0': 18, '1': 18, '2': 22, '3': 24, '4': 26, '5': 28, '6': 30, '7': 32, '8': 35, '9': 30 };
  return pricesByRegion[digits[0]] || 30;
}

function updateShipping(cep) {
  currentShipping = calculateShipping(cep);
  if (shippingEl) shippingEl.textContent = currentShipping ? formatPrice(currentShipping) : 'Informe o CEP';
  updateTotals();
}

function saveCart(cart) {
  writeStorage(CART_KEY, cart);
}

function getCatalogProducts() {
  const featured = JSON.parse(localStorage.getItem('featuredProducts') || '[]');
  const best = JSON.parse(localStorage.getItem('bestSellers') || '[]');
  const saved = JSON.parse(localStorage.getItem('lojaProducts') || '[]');
  const merged = [...featured, ...best, ...saved];
  return merged.length ? merged : allProducts;
}

function getProductInfo(productId) {
  const catalog = getCatalogProducts();
  return catalog.find(p => p.id === productId) || { name: 'Produto', price: 0, img: 'https://via.placeholder.com/200' };
}

function updateCartDisplay() {
  const cart = getCart();
  cartContainer.innerHTML = '';

  if (cart.length === 0) {
    emptyMessage.style.display = 'block';
    cartTotal.textContent = formatPrice(0);
    subtotalEl.textContent = formatPrice(0);
    discountEl.textContent = formatPrice(0);
    currentShipping = 0;
    if (shippingEl) shippingEl.textContent = 'Informe o CEP';
    finishButton.disabled = true;
    cartSubtitle.textContent = '0 itens no carrinho';
    return;
  }

  emptyMessage.style.display = 'none';
  finishButton.disabled = false;

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  cartSubtitle.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'} no carrinho`;

  cart.forEach((item, index) => {
    const product = getProductInfo(item.id);
    const itemTotal = item.price * item.qty;
    
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <img src="${product.img}" alt="${item.name}" loading="lazy">
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p>${formatPrice(item.price)}</p>
        ${item.size ? `<p class="cart-item-size">Tamanho: ${item.size}</p>` : ''}
        <div class="cart-price">
          <span>Subtotal:</span>
          <span class="cart-item-price">${formatPrice(itemTotal)}</span>
        </div>
      </div>
      <div class="cart-actions">
        <div class="cart-qty-control">
          <button class="qty-minus" type="button">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-plus" type="button">+</button>
        </div>
        <button class="btn-remove" type="button">🗑️</button>
      </div>
    `;

    itemElement.querySelector('.qty-minus').addEventListener('click', () => {
      if (cart[index].qty > 1) {
        cart[index].qty -= 1;
        saveCart(cart);
        updateCartDisplay();
      }
    });

    itemElement.querySelector('.qty-plus').addEventListener('click', () => {
      const available = Number(getProductInfo(cart[index].id).qty ?? getProductInfo(cart[index].id).quantity ?? 0);
      if (cart[index].qty >= available) {
        alert('Você atingiu a quantidade disponível em estoque para este produto.');
        return;
      }
      cart[index].qty += 1;
      saveCart(cart);
      updateCartDisplay();
    });

    itemElement.querySelector('.btn-remove').addEventListener('click', () => {
      cart.splice(index, 1);
      saveCart(cart);
      updateCartDisplay();
      updateMainCartCount();
    });

    cartContainer.appendChild(itemElement);
  });

  updateTotals();
}

function updateTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = subtotal * (currentDiscount / 100);
  const total = subtotal - discount + currentShipping;

  subtotalEl.textContent = formatPrice(subtotal);
  discountEl.textContent = discount > 0 ? `-${formatPrice(discount)}` : 'R$0,00';
  cartTotal.textContent = formatPrice(total);
}

function getOrderTotal() {
  const subtotal = getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
  return subtotal - subtotal * (currentDiscount / 100) + currentShipping;
}

function formatPixField(id, value) {
  const text = String(value);
  return `${id}${String(text.length).padStart(2, '0')}${text}`;
}

function crc16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function generatePixCode(amount, transactionId) {
  const merchantAccount = formatPixField('00', 'BR.GOV.BCB.PIX') + formatPixField('01', PIX_KEY);
  const payload = [
    formatPixField('00', '01'),
    formatPixField('26', merchantAccount),
    formatPixField('52', '0000'),
    formatPixField('53', '986'),
    formatPixField('54', amount.toFixed(2)),
    formatPixField('58', 'BR'),
    formatPixField('59', PIX_RECEIVER_NAME.substring(0, 25)),
    formatPixField('60', PIX_RECEIVER_CITY.substring(0, 15)),
    formatPixField('62', formatPixField('05', transactionId.substring(0, 25)))
  ].join('');
  return `${payload}6304${crc16(`${payload}6304`)}`;
}

function openPixCheckout() {
  if (!PIX_KEY.trim()) {
    alert('A chave PIX da loja ainda não foi configurada. Adicione a chave na constante PIX_KEY do arquivo js/cart.js antes de receber pagamentos.');
    return;
  }
  const total = getOrderTotal();
  const transactionId = `PED${Date.now()}`;
  pixCode.value = generatePixCode(total, transactionId);
  pixTotal.textContent = formatPrice(total);
  pixModal.classList.remove('hidden');
}

function sendOrderNotification(cart = getCart()) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal - subtotal * (currentDiscount / 100) + currentShipping;
  const items = cart.map(item => `• ${item.qty}x ${item.name}${item.size ? ` (Tamanho ${item.size})` : ''} — ${formatPrice(item.price * item.qty)}`).join('\n');
  const message = [
    'NOVO PEDIDO — PIX INFORMADO',
    `Data: ${new Date().toLocaleString('pt-BR')}`,
    '',
    'Itens:',
    items,
    '',
    `Frete: ${formatPrice(currentShipping)}`,
    `Total: ${formatPrice(total)}`,
    'Status: cliente informou que realizou o pagamento PIX.'
  ].join('\n');
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}

function updateMainCartCount() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const countEl = document.querySelector('#cartCount');
  if (countEl) countEl.textContent = total;
}

// Coupon handling
if (applyCoupon) {
  applyCoupon.addEventListener('click', () => {
    const code = document.getElementById('couponCode').value.trim().toUpperCase();
    
    // Simulated coupons
    const coupons = {
      'WELCOME10': 10,
      'FASHION15': 15,
      'ELEGANTE20': 20
    };

    if (coupons[code]) {
      currentDiscount = coupons[code];
      applyCoupon.textContent = `✓ Cupom: ${currentDiscount}% off`;
      applyCoupon.style.background = '#d94a6a';
      applyCoupon.style.color = '#fff';
      updateTotals();
    } else if (code) {
      alert('Cupom inválido. Tente: WELCOME10, FASHION15 ou ELEGANTE20');
    }
  });
}

// Finish purchase
finishButton.addEventListener('click', openPixCheckout);

copyPixButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(pixCode.value);
    copyPixButton.textContent = 'Código PIX copiado!';
  } catch {
    pixCode.select();
    document.execCommand('copy');
    copyPixButton.textContent = 'Código PIX copiado!';
  }
});

closePixModal.addEventListener('click', () => pixModal.classList.add('hidden'));

confirmPaymentButton.addEventListener('click', () => {
  const cart = getCart();
  if (!cart.length || !completeOrder(cart)) return;

  sendOrderNotification(cart);
  pixModal.classList.add('hidden');
  alert('Pedido registrado. A mensagem com os detalhes foi aberta no WhatsApp para envio à loja.');
});

// Categories menu (from header)
const categoriesButton = document.getElementById('categoriesButton');
const categoryMenu = document.getElementById('categoryMenu');

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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartDisplay();
});

// Checkout por WhatsApp com preenchimento automático do endereço via ViaCEP.
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const orderReview = document.getElementById('orderReview');
const reviewSubtotal = document.getElementById('reviewSubtotal');
const reviewShipping = document.getElementById('reviewShipping');
const reviewTotal = document.getElementById('reviewTotal');
const orderReviewCustomer = document.getElementById('orderReviewCustomer');
const backToCheckoutButton = document.getElementById('backToCheckoutButton');
const confirmOrderButton = document.getElementById('confirmOrderButton');
const checkoutFinishButton = finishButton.cloneNode(true);
finishButton.replaceWith(checkoutFinishButton);

function checkoutField(id) {
  return document.getElementById(id);
}

function getStorePayload() {
  const list = key => readStorage(key, []);
  return {
    featuredProducts: list('featuredProducts'),
    bestSellers: list('bestSellers'),
    lojaProducts: list('lojaProducts'),
    categorySectionImages: list('categorySectionImages')
  };
}

async function syncStoreOnline() {
  try {
    await fetch('/api/store', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(getStorePayload()) });
  } catch {}
}

async function loadStoreFromServer() {
  try {
    const response = await fetch('/api/store', { cache: 'no-store' });
    if (!response.ok) return;
    const store = await response.json();
    ['featuredProducts', 'bestSellers', 'lojaProducts', 'categorySectionImages'].forEach(key => {
      if (Array.isArray(store[key]) && store[key].length) writeStorage(key, store[key]);
    });
    updateCartDisplay();
  } catch {}
}

function completeOrder(cart) {
  const catalog = getCatalogProducts();
  const unavailable = cart.find(item => {
    const product = catalog.find(candidate => candidate.id === item.id);
    return !product || Number(product.qty ?? product.quantity ?? 0) < Number(item.qty || 0);
  });

  if (unavailable) {
    alert(`Não há estoque suficiente para ${unavailable.name}. Revise seu carrinho.`);
    return false;
  }

  const sources = [
    { key: 'featuredProducts', fallback: allProducts.filter(product => product.id.startsWith('f')) },
    { key: 'bestSellers', fallback: allProducts.filter(product => product.id.startsWith('b')) },
    { key: 'lojaProducts', fallback: [] }
  ];

  sources.forEach(({ key, fallback }) => {
    const stored = readStorage(key, fallback);
    if (!Array.isArray(stored) || !stored.length) return;
    const updated = stored.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (!cartItem) return product;
      const quantity = Number(product.qty ?? product.quantity ?? 0);
      return { ...product, qty: Math.max(0, quantity - Number(cartItem.qty || 0)) };
    });
    writeStorage(key, updated);
  });

  saveCart([]);
  updateCartDisplay();
  updateMainCartCount();
  syncStoreOnline();
  return true;
}

function onlyCep(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatCheckoutCep() {
  const field = checkoutField('customerCep');
  const cep = onlyCep(field.value).slice(0, 8);
  field.value = cep.length > 5 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep;
  updateShipping(field.value);
}

async function fillAddressFromCep() {
  const cepField = checkoutField('customerCep');
  const status = checkoutField('cepStatus');
  const cep = onlyCep(cepField.value);
  formatCheckoutCep();

  if (cep.length !== 8) {
    status.textContent = 'Digite um CEP com 8 números.';
    return;
  }

  updateShipping(cep);
  status.textContent = 'Buscando endereço...';
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) throw new Error('Falha na consulta');
    const address = await response.json();
    if (address.erro) throw new Error('CEP não encontrado');

    checkoutField('customerStreet').value = address.logradouro || '';
    checkoutField('customerNeighborhood').value = address.bairro || '';
    checkoutField('customerCity').value = address.localidade || '';
    checkoutField('customerState').value = address.uf || '';
    status.textContent = 'Endereço preenchido. Informe o número e confira os dados.';
    checkoutField('customerNumber').focus();
  } catch {
    status.textContent = 'Não foi possível localizar o CEP. Preencha o endereço manualmente.';
  }
}

function sendCheckoutToWhatsApp() {
  const cart = getCart();
  const cep = onlyCep(checkoutField('customerCep').value);
  if (cep.length !== 8) {
    alert('Informe um CEP válido para calcular o frete.');
    return;
  }
  updateShipping(cep);
  if (onlyCep(checkoutField('customerCpf').value).length !== 11) {
    alert('Informe um CPF válido com 11 números.');
    return;
  }
  const total = getOrderTotal();
  const value = id => checkoutField(id).value.trim();
  const items = cart.map(item => `• ${item.qty}x ${item.name}${item.size ? ` (Tamanho ${item.size})` : ''} — ${formatPrice(item.price * item.qty)}`).join('\n');
  const complement = value('customerComplement');
  const message = [
    'NOVO PEDIDO',
    `Data: ${new Date().toLocaleString('pt-BR')}`,
    '',
    `Cliente: ${value('customerName')}`,
    `Telefone: ${value('customerPhone')}`,
    `CPF: ${value('customerCpf')}`,
    '',
    'Entrega:',
    `CEP: ${value('customerCep')}`,
    `${value('customerStreet')}, ${value('customerNumber')}${complement ? ` - ${complement}` : ''}`,
    `${value('customerNeighborhood')} - ${value('customerCity')}/${value('customerState')}`,
    '',
    'Itens:',
    items,
    '',
    `Frete: ${formatPrice(currentShipping)}`,
    `Quantidade de itens: ${cart.reduce((sum, item) => sum + Number(item.qty || 0), 0)}`,
    `Total do pedido: ${formatPrice(total)}`
  ].join('\n');

  if (!completeOrder(cart)) return;
  checkoutModal.classList.add('hidden');
  window.location.href = `https://wa.me/5511981599583?text=${encodeURIComponent(message)}`;
}

function showOrderReview() {
  const cep = onlyCep(checkoutField('customerCep').value);
  if (cep.length !== 8) {
    alert('Informe um CEP válido para calcular o frete.');
    return;
  }
  updateShipping(cep);
  const subtotal = getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = subtotal * (currentDiscount / 100);
  const total = subtotal - discount + currentShipping;
  const value = id => checkoutField(id).value.trim();
  orderReviewCustomer.innerHTML = `<strong>${value('customerName')}</strong><span>CPF: ${value('customerCpf')} · ${value('customerCity')}/${value('customerState')}</span>`;
  reviewSubtotal.textContent = formatPrice(subtotal - discount);
  reviewShipping.textContent = formatPrice(currentShipping);
  reviewTotal.textContent = formatPrice(total);
  checkoutForm.hidden = true;
  orderReview.hidden = false;
}

checkoutFinishButton.addEventListener('click', () => {
  if (!getCart().length) {
    alert('Adicione ao menos um produto ao carrinho antes de finalizar a compra.');
    return;
  }
  checkoutForm.hidden = false;
  orderReview.hidden = true;
  checkoutModal.classList.remove('hidden');
  checkoutField('customerName').focus();
});

checkoutField('closeCheckoutModal').addEventListener('click', () => checkoutModal.classList.add('hidden'));
checkoutField('customerCep').addEventListener('input', formatCheckoutCep);
checkoutField('customerCep').addEventListener('blur', fillAddressFromCep);
checkoutField('customerCpf').addEventListener('input', event => {
  const digits = onlyCep(event.target.value).slice(0, 11);
  event.target.value = digits.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
});
checkoutForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!checkoutForm.reportValidity()) return;
  showOrderReview();
});

backToCheckoutButton.addEventListener('click', () => {
  orderReview.hidden = true;
  checkoutForm.hidden = false;
});

confirmOrderButton.addEventListener('click', () => sendCheckoutToWhatsApp());

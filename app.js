/*
 * Gload's editable storefront data. Update this object for product, price,
 * stock, image, discount and offer changes without touching UI components.
 * Replace image URLs with /images/dog-product-1.jpg etc. when product photos land.
 */
const storeConfig = {
  currency: 'USD',
  currencySymbol: '$',
  bundleDiscount: 10,
  // Editable volume offer: applied before the Complete Pet Bundle saving.
  buyMoreSaveMore: [{ minimumItems: 3, discount: 5 }],
  products: {
    dogProduct: {
      id: 'dog-product', category: 'Dogs',
      name: 'Walk Companion', // Placeholder name — easy to replace.
      price: 39, originalPrice: 49, availability: 'In stock',
      description: 'A compact 3-in-1 retractable leash designed to keep the everyday walk feeling considered.',
      features: ['Retractable leash', 'Built-in water bottle & drinking bowl', 'Integrated poop bag holder', 'Compact, carry-easy design'],
      variants: ['Sage'],
      // Replace these with: /images/dog-product-1.jpg, dog-product-2.jpg, dog-product-3.jpg
      images: [
        'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1000&q=82',
        'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=700&q=80',
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=700&q=80'
      ]
    },
    catProduct: {
      id: 'cat-product', category: 'Cats',
      name: 'Play Orbit', // Placeholder name — easy to replace.
      price: 35, originalPrice: 42, availability: 'In stock',
      description: 'A rechargeable, remote-control interactive toy designed to bring a little more curiosity to playtime.',
      // Do not add obstacle avoidance or play modes unless the chosen product model supports them.
      features: ['Remote control', 'Rechargeable battery', 'Interactive movement', 'Designed for supervised play'],
      variants: ['Warm sand'],
      // Replace these with: /images/cat-product-1.jpg, cat-product-2.jpg, cat-product-3.jpg
      images: [
        'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=700&q=80',
        'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=700&q=80'
      ]
    }
  }
};

const products = Object.values(storeConfig.products);
let cart = JSON.parse(localStorage.getItem('gload-cart') || '[]');
const money = value => `${storeConfig.currencySymbol}${value.toFixed(2)}`;
const getProduct = id => products.find(product => product.id === id);
const getCartItem = id => cart.find(item => item.id === id);
const saveCart = () => localStorage.setItem('gload-cart', JSON.stringify(cart));

function productMarkup(product) {
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  return `<div class="product-gallery"><div class="thumbs">${product.images.map((image, index) => `<button class="thumb ${index === 0 ? 'active' : ''}" style="background-image:url('${image}')" data-image="${image}" aria-label="View ${product.name} image ${index + 1}"></button>`).join('')}</div><div class="main-product-image" style="background-image:url('${product.images[0]}')" role="img" aria-label="${product.name}"></div></div><div class="product-info"><p class="product-kind">${product.category} / ${product.availability}</p><h3>${product.name}</h3><div class="price-line"><span class="price">${money(product.price)}</span><span class="compare">${money(product.originalPrice)}</span><span class="discount">Save ${discount}%</span></div><p class="product-description">${product.description}</p><ul class="features">${product.features.map(feature => `<li>${feature}</li>`).join('')}</ul><div class="buy-row"><div class="quantity" data-product="${product.id}"><button class="qty-minus" aria-label="Decrease quantity">−</button><span>1</span><button class="qty-plus" aria-label="Increase quantity">+</button></div><div class="purchase-actions"><button class="button button-dark add-product" data-product="${product.id}">Add to bag <b>→</b></button>${product.id === 'dog-product' ? '<div style="display: flex; justify-content: center; width: 100%; margin-top: 15px;"><div class="shopify-buy-button" id="product-component-1790283533240"></div></div>' : ''}</div></div></div>`;
}

document.querySelector('.dog-product').innerHTML = productMarkup(storeConfig.products.dogProduct);
document.querySelector('.cat-product').innerHTML = productMarkup(storeConfig.products.catProduct);
document.querySelector('#bundle-percent').textContent = `${storeConfig.bundleDiscount}%`;

document.addEventListener('click', event => {
  const thumb = event.target.closest('.thumb');
  if (thumb) {
    const gallery = thumb.closest('.product-gallery');
    gallery.querySelector('.main-product-image').style.backgroundImage = `url('${thumb.dataset.image}')`;
    gallery.querySelectorAll('.thumb').forEach(button => button.classList.toggle('active', button === thumb));
  }
  const quantityButton = event.target.closest('.buy-row .quantity button');
  if (quantityButton) {
    const count = quantityButton.parentElement.querySelector('span');
    count.textContent = Math.max(1, Number(count.textContent) + (quantityButton.classList.contains('qty-plus') ? 1 : -1));
  }
  const addButton = event.target.closest('.add-product');
  if (addButton) addToCart(addButton.dataset.product, Number(addButton.previousElementSibling.querySelector('span').textContent));
});

function addToCart(id, quantity = 1) {
  const item = getCartItem(id);
  if (item) item.quantity += quantity;
  else cart.push({ id, quantity });
  saveCart(); renderCart(); showToast();
}

function changeQuantity(id, change) {
  const item = getCartItem(id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity < 1) cart = cart.filter(cartItem => cartItem.id !== id);
  saveCart(); renderCart();
}

function cartCalculations() {
  const subtotal = cart.reduce((total, item) => total + getProduct(item.id).price * item.quantity, 0);
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const volumeOffer = [...storeConfig.buyMoreSaveMore].sort((a, b) => b.minimumItems - a.minimumItems).find(offer => itemCount >= offer.minimumItems);
  const volumeSaving = volumeOffer ? subtotal * (volumeOffer.discount / 100) : 0;
  const pairedBundles = Math.min(getCartItem('dog-product')?.quantity || 0, getCartItem('cat-product')?.quantity || 0);
  const bundleBase = pairedBundles * (storeConfig.products.dogProduct.price + storeConfig.products.catProduct.price);
  const bundleSaving = bundleBase * (storeConfig.bundleDiscount / 100);
  return { subtotal, volumeSaving, volumeOffer, bundleSaving, total: subtotal - volumeSaving - bundleSaving };
}

function renderCart() {
  const { subtotal, volumeSaving, volumeOffer, bundleSaving, total } = cartCalculations();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(element => element.textContent = count);
  const items = document.querySelector('.cart-items');
  const empty = document.querySelector('.cart-empty');
  items.innerHTML = cart.map(item => {
    const product = getProduct(item.id);
    return `<article class="cart-item"><div class="cart-item-image" style="background-image:url('${product.images[0]}')"></div><div><h3>${product.name}</h3><span class="price">${money(product.price)}</span><div class="quantity"><button data-cart-quantity="${product.id}" data-change="-1" aria-label="Decrease ${product.name} quantity">−</button><span>${item.quantity}</span><button data-cart-quantity="${product.id}" data-change="1" aria-label="Increase ${product.name} quantity">+</button></div></div><button class="remove" data-remove="${product.id}">Remove</button></article>`;
  }).join('');
  items.style.display = cart.length ? 'block' : 'none'; empty.style.display = cart.length ? 'none' : 'flex';
  document.querySelector('.subtotal').textContent = money(subtotal);
  const generalDiscount = document.querySelector('.general-discount-row');
  generalDiscount.classList.toggle('hidden', !volumeSaving);
  document.querySelector('.general-saving').textContent = `−${money(volumeSaving)}${volumeOffer ? ` (${volumeOffer.discount}%)` : ''}`;
  document.querySelector('.bundle-saving').textContent = `−${money(bundleSaving)}`;
  document.querySelector('.discount-row').classList.toggle('hidden', !bundleSaving);
  document.querySelector('.total-price').textContent = money(total);
}

document.querySelector('.cart-items').addEventListener('click', event => {
  const quantity = event.target.closest('[data-cart-quantity]');
  if (quantity) changeQuantity(quantity.dataset.cartQuantity, Number(quantity.dataset.change));
  const remove = event.target.closest('[data-remove]');
  if (remove) { cart = cart.filter(item => item.id !== remove.dataset.remove); saveCart(); renderCart(); }
});

const body = document.body;
const cartDrawer = document.querySelector('.cart-drawer');
function openCart() { body.classList.add('cart-open'); cartDrawer.setAttribute('aria-hidden', 'false'); }
function closeCart() { body.classList.remove('cart-open'); cartDrawer.setAttribute('aria-hidden', 'true'); }
document.querySelectorAll('.cart-trigger,.toast-cart').forEach(button => button.addEventListener('click', openCart));
document.querySelectorAll('.close-cart,.scrim').forEach(button => button.addEventListener('click', closeCart));
document.querySelector('.add-bundle').addEventListener('click', () => { products.forEach(product => addToCart(product.id)); openCart(); });
let toastTimer;
function showToast() { const toast = document.querySelector('.toast'); toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3000); }

const checkout = document.querySelector('.checkout-modal');
function renderCheckout() {
  const { subtotal, volumeSaving, volumeOffer, bundleSaving, total } = cartCalculations();
  document.querySelector('.checkout-items').innerHTML = cart.map(item => { const p = getProduct(item.id); return `<div class="checkout-summary-item"><img src="${p.images[0]}" alt="${p.name}"><div><p>${p.name}</p><span>Qty ${item.quantity}</span></div><strong>${money(p.price * item.quantity)}</strong></div>`; }).join('');
  document.querySelector('.checkout-totals').innerHTML = `<div><span>Subtotal</span><strong>${money(subtotal)}</strong></div>${volumeSaving ? `<div><span>Buy more saving (${volumeOffer.discount}%)</span><strong>−${money(volumeSaving)}</strong></div>` : ''}${bundleSaving ? `<div><span>Bundle saving</span><strong>−${money(bundleSaving)}</strong></div>` : ''}<div class="total"><span>Total</span><strong>${money(total)}</strong></div>`;
}
document.querySelector('.checkout-button').addEventListener('click', () => { if (!cart.length) return; closeCart(); renderCheckout(); checkout.classList.add('open'); checkout.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; });
document.querySelector('.checkout-close').addEventListener('click', () => { checkout.classList.remove('open'); checkout.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; });
document.querySelector('#checkout-form').addEventListener('submit', event => { event.preventDefault(); alert('Payment is not configured yet. Connect a payment provider to complete checkout.'); });

const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click', () => { const open = document.querySelector('.site-header').classList.toggle('menu-open'); menu.setAttribute('aria-expanded', open); });
document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', () => document.querySelector('.site-header').classList.remove('menu-open')));
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .1 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
renderCart();

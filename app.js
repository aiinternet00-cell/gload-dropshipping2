/*
 * Gload's editable storefront data. Update this object for product, price,
 * stock, image, discount and offer changes without touching UI components.
 * Replace image URLs with /images/dog-product-1.jpg etc. when product photos land.
 */
const storeConfig = {
  currency: 'USD',
  currencySymbol: '$',
  bundleDiscount: 10,
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

const money = value => `${storeConfig.currencySymbol}${value.toFixed(2)}`;

function productMarkup(product) {
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const shopifyComponentId = product.id === 'dog-product'
    ? 'product-component-1790283533240'
    : 'product-component-1791036437552';
  return `<div class="product-gallery"><div class="thumbs">${product.images.map((image, index) => `<button class="thumb ${index === 0 ? 'active' : ''}" style="background-image:url('${image}')" data-image="${image}" aria-label="View ${product.name} image ${index + 1}"></button>`).join('')}</div><div class="main-product-image" style="background-image:url('${product.images[0]}')" role="img" aria-label="${product.name}"></div></div><div class="product-info"><p class="product-kind">${product.category} / ${product.availability}</p><h3>${product.name}</h3><div class="price-line"><span class="price">${money(product.price)}</span><span class="compare">${money(product.originalPrice)}</span><span class="discount">Save ${discount}%</span></div><p class="product-description">${product.description}</p><ul class="features">${product.features.map(feature => `<li>${feature}</li>`).join('')}</ul><div class="buy-row"><div class="purchase-actions"><div style="display: flex; justify-content: center; width: 100%; margin-top: 15px;"><div class="shopify-buy-button" id="${shopifyComponentId}"></div></div></div></div></div>`;
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
});

const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click', () => { const open = document.querySelector('.site-header').classList.toggle('menu-open'); menu.setAttribute('aria-expanded', open); });
document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', () => document.querySelector('.site-header').classList.remove('menu-open')));
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .1 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

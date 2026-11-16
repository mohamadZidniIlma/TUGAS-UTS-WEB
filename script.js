/**
 * ============================================================================
 * PROJECT TUGAS PEMROGRAMAN WEB: WEBSITE TOKO KELONTONG (TOKO 60)
 * Mahasiswa : Mohamad Zidni Ilma
 * File      : script.js (JavaScript ES6)
 * Deskripsi : Logika interaktivitas website (Navigasi 7 Halaman, Keranjang Belanja,
 *             Checkout WhatsApp 0822-9552-5153, Filter Katalog, dan Form Kontak).
 * ============================================================================
 */

// 1. DATA INFORMASI TOKO & PRODUK RESMI (Hanya 6 Produk Sesuai Foto Asli)
const TOKO_INFO = {
  name: 'TOKO 60',
  address: 'Jalan Cinehel No. 60 RT 04 RW 04, Kelurahan Nagarasari',
  phone: '0822-9552-5153',
  whatsappRaw: '6282295525153',
  minFreeDelivery: 50000,
  deliveryFee: 5000
};

const PRODUCTS = [
  {
    id: 'prod-gas',
    name: 'Gas Elpiji 3 Kg Melon Pertamina (Tukar Tabung)',
    category: 'gas',
    price: 22000,
    unit: 'tabung 3 kg',
    image: 'image/GAS_6bb7e1f8.jpg',
    badge: 'Segel Resmi',
    desc: 'Gas LPG 3kg bersubsidi resmi Pertamina segel utuh dan barcode aman.'
  },
  {
    id: 'prod-indomie',
    name: 'Indomie Mi Goreng Spesial',
    category: 'instan',
    price: 3100,
    unit: 'bungkus 80 gr',
    image: 'image/indomie.jpg',
    badge: 'Paling Laris',
    desc: 'Mi instan goreng legendaris dengan bumbu gurih dan bawang goreng renyah.'
  },
  {
    id: 'prod-kopi',
    name: 'Kopi Kapal Api Special Mix (10 Sachet)',
    category: 'minuman',
    price: 14500,
    unit: 'renteng (10 sachet)',
    image: 'image/kopi.jpg',
    badge: 'Favorit Pagi',
    desc: 'Kopi bubuk hitam mantap berpadu gula murni dalam sachet praktis.'
  },
  {
    id: 'prod-teh',
    name: 'Teh Pucuk Harum Botol 350 ml',
    category: 'minuman',
    price: 4000,
    unit: 'botol 350 ml',
    image: 'image/PUCUK.jpg',
    badge: 'Segar & Dingin',
    desc: 'Minuman teh melati segar asli dari pucuk daun teh pilihan.'
  },
  
   
];

// 2. STATE KERANJANG BELANJA (CART)
let cart = JSON.parse(localStorage.getItem('zidni_cart') || '[]');

function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
}

// 3. FUNGSI NAVIGASI 7 HALAMAN (SPA VANILLA JS)
function zidniNavigate(pageId) {
  // Sembunyikan semua section
  document.querySelectorAll('.zidni_page_section').forEach(sec => {
    sec.classList.remove('active');
  });

  // Tampilkan section yang dipilih
  const targetSec = document.getElementById(`zidni_page_${pageId}`);
  if (targetSec) {
    targetSec.classList.add('active');
  }

  // Update status active pada menu
  document.querySelectorAll('.zidni_menu_item').forEach(item => {
    if (item.dataset.page === pageId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4. RENDER DAFTAR PRODUK (KATALOG & BERANDA)
function renderProducts(filterCategory = 'all', searchTerm = '') {
  const container = document.getElementById('zidni_catalog_grid');
  const homeGrid = document.getElementById('zidni_home_products_grid');
  
  if (!container && !homeGrid) return;

  const filtered = PRODUCTS.filter(p => {
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const generateCardHTML = (p) => `
    <div class="zidni_product_card">
      <div class="zidni_product_img_wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="zidni_product_badge">${p.badge}</span>
      </div>
      <div class="zidni_product_info">
        <span class="zidni_product_cat">${p.unit}</span>
        <h4 class="zidni_product_title">${p.name}</h4>
        <p class="zidni_product_desc">${p.desc}</p>
        <div class="zidni_product_bottom">
          <div class="zidni_price_box">
            <span class="zidni_price_current">${formatRupiah(p.price)}</span>
            <span class="zidni_price_unit">per ${p.unit}</span>
          </div>
          <button class="zidni_btn_add" onclick="zidniAddToCart('${p.id}')">
            + Tambah
          </button>
        </div>
      </div>
    </div>
  `;

  if (container) {
    container.innerHTML = filtered.map(generateCardHTML).join('');
  }
  if (homeGrid) {
    homeGrid.innerHTML = PRODUCTS.slice(0, 4).map(generateCardHTML).join('');
  }
}

// 5. MANAJEMEN KERANJANG BELANJA (ADD, UPDATE, REMOVE)
function zidniAddToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  updateCartUI();
  zidniOpenCart();
}

function zidniUpdateQty(productId, change) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += change;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('zidni_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const countBadge = document.getElementById('zidni_cart_count');
  const itemsContainer = document.getElementById('zidni_cart_items');
  const subtotalElem = document.getElementById('zidni_cart_subtotal');
  const deliveryElem = document.getElementById('zidni_cart_delivery');
  const totalElem = document.getElementById('zidni_cart_total');

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  if (countBadge) countBadge.innerText = totalCount;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = subtotal >= TOKO_INFO.minFreeDelivery || subtotal === 0 ? 0 : TOKO_INFO.deliveryFee;
  const grandTotal = subtotal + deliveryFee;

  if (subtotalElem) subtotalElem.innerText = formatRupiah(subtotal);
  if (deliveryElem) deliveryElem.innerText = deliveryFee === 0 && subtotal > 0 ? 'GRATIS' : formatRupiah(deliveryFee);
  if (totalElem) totalElem.innerText = formatRupiah(grandTotal);

  if (itemsContainer) {
    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: #78716c;">
          <p style="font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem;">Keranjang Anda masih kosong</p>
          <p style="font-size: 0.8rem;">Pilih produk gas, mie, kopi, teh, atau plastik dari katalog kami.</p>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = cart.map(item => `
        <div style="display: flex; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid #e7e5e4; align-items: center;">
          <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
          <div style="flex-grow: 1;">
            <div style="font-size: 0.85rem; font-weight: 700;">${item.name}</div>
            <div style="font-size: 0.75rem; color: #78716c;">${formatRupiah(item.price)} x ${item.qty}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button onclick="zidniUpdateQty('${item.id}', -1)" style="padding: 2px 8px; background: #e7e5e4; border-radius: 4px; font-weight: bold;">-</button>
            <span style="font-size: 0.85rem; font-weight: 700; min-width: 16px; text-align: center;">${item.qty}</span>
            <button onclick="zidniUpdateQty('${item.id}', 1)" style="padding: 2px 8px; background: #e7e5e4; border-radius: 4px; font-weight: bold;">+</button>
          </div>
        </div>
      `).join('');
    }
  }
}

// 6. CHECKOUT VIA WHATSAPP (NO HP TOKO 60: 0822-9552-5153)
function zidniCheckoutWA() {
  if (cart.length === 0) {
    alert('Keranjang belanja Anda masih kosong!');
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const delivery = subtotal >= TOKO_INFO.minFreeDelivery ? 0 : TOKO_INFO.deliveryFee;
  const total = subtotal + delivery;

  let text = `*PESANAN BELANJA - TOKO 60 JALAN CINEHEL*\n`;
  text += `--------------------------------------\n`;
  cart.forEach((item, index) => {
    text += `${index + 1}. ${item.name} (${item.qty} ${item.unit}) = ${formatRupiah(item.price * item.qty)}\n`;
  });
  text += `--------------------------------------\n`;
  text += `Subtotal: ${formatRupiah(subtotal)}\n`;
  text += `Ongkos Kirim: ${delivery === 0 ? 'GRATIS (Radius 2km)' : formatRupiah(delivery)}\n`;
  text += `*TOTAL PEMBAYARAN: ${formatRupiah(total)}*\n\n`;
  text += `Mohon konfirmasi pesanan dan kirimkan ke alamat saya. Terima kasih!`;

  const waUrl = `https://wa.me/${TOKO_INFO.whatsappRaw}?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
}

// 7. KONTROL DRAWER KERANJANG
function zidniOpenCart() {
  document.getElementById('zidni_cart_drawer')?.classList.add('open');
  document.getElementById('zidni_cart_backdrop')?.classList.add('open');
}

function zidniCloseCart() {
  document.getElementById('zidni_cart_drawer')?.classList.remove('open');
  document.getElementById('zidni_cart_backdrop')?.classList.remove('open');
}

// 8. EVENT LISTENER SAAT HALAMAN DIMUAT
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartUI();

  // Inisialisasi filter kategori katalog
  document.querySelectorAll('.zidni_filter_btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.zidni_filter_btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderProducts(e.target.dataset.cat);
    });
  });

  // Search katalog
  document.getElementById('zidni_search_input')?.addEventListener('input', (e) => {
    renderProducts('all', e.target.value);
  });

  // Form Kontak
  document.getElementById('zidni_contact_form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = document.getElementById('zidni_input_nama').value;
    const pesan = document.getElementById('zidni_input_pesan').value;
    
    const waText = `Halo Pemilik TOKO 60, perkenalkan saya ${nama}. ${pesan}`;
    window.open(`https://wa.me/${TOKO_INFO.whatsappRaw}?text=${encodeURIComponent(waText)}`, '_blank');
    alert('Terima kasih! Pesan Anda diteruskan langsung ke WhatsApp TOKO 60.');
  });
});

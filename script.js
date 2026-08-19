// State Management
let currentUser = null;
let cart = [];
let products = [];
let generatedOTP = null;
let pendingLogin = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    checkSession();
});

// Load Products from JSON
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback products
        products = [
            {
                id: 1,
                name: "iPhone 15 Pro",
                price: 15000000,
                description: "Smartphone premium dengan kamera pro dan chip A17 Pro",
                image: "https://via.placeholder.com/300x200/000000/ffffff?text=iPhone+15+Pro",
                stock: 10
            },
            {
                id: 2,
                name: "MacBook Air M2",
                price: 18000000,
                description: "Laptop tipis dan ringan dengan performa luar biasa",
                image: "https://via.placeholder.com/300x200/808080/ffffff?text=MacBook+Air",
                stock: 5
            },
            {
                id: 3,
                name: "AirPods Pro 2",
                price: 3500000,
                description: "Earbuds dengan noise cancellation terbaik",
                image: "https://via.placeholder.com/300x200/ffffff/000000?text=AirPods+Pro",
                stock: 20
            }
        ];
        renderProducts();
    }
});

// Check Session
function checkSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        document.getElementById('loginModal').style.display = 'flex';
    }
}

// Tab Switching
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('emailLogin').style.display = tab === 'email' ? 'flex' : 'none';
    document.getElementById('phoneLogin').style.display = tab === 'phone' ? 'flex' : 'none';
}

// Send OTP
function sendOTP(method) {
    const email = document.getElementById('loginEmail').value;
    const phone = document.getElementById('loginPhone').value;
    
    if (method === 'email' && !email) {
        alert('Silakan masukkan email');
        return;
    }
    
    if (method === 'phone' && !phone) {
        alert('Silakan masukkan nomor HP');
        return;
    }
    
    // Generate 6-digit OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In real implementation, send OTP via email/SMS
    // For demo, show OTP in alert
    alert(`OTP Anda: ${generatedOTP}\n(Dalam implementasi nyata, OTP akan dikirim via email/SMS)`);
    
    pendingLogin = {
        method: method,
        value: method === 'email' ? email : phone
    };
    
    document.getElementById('otpSection').style.display = 'block';
}

// Verify OTP
function verifyOTP() {
    const otpInput = document.getElementById('otpInput').value;
    
    if (otpInput === generatedOTP) {
        // OTP verified
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('usernameModal').style.display = 'flex';
    } else {
        alert('OTP salah! Silakan coba lagi.');
    }
}

// Google Login (simulated)
function googleLogin() {
    // In real implementation, use Google OAuth
    alert('Google Login akan diimplementasikan dengan Google OAuth API');
    // Simulate successful login
    pendingLogin = {
        method: 'google',
        value: 'user@gmail.com'
    };
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('usernameModal').style.display = 'flex';
}

// Set Username
function setUsername() {
    const username = document.getElementById('usernameInput').value.trim();
    
    if (username.length < 3) {
        document.getElementById('usernameError').textContent = 'Username minimal 3 karakter';
        return;
    }
    
    // Check if username exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.username === username)) {
        document.getElementById('usernameError').textContent = 'Username sudah digunakan';
        return;
    }
    
    // Create user
    const user = {
        email: pendingLogin.value,
        password: generatedOTP || 'google-auth',
        username: username,
        loginMethod: pendingLogin.method
    };
    
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    document.getElementById('usernameModal').style.display = 'none';
    showMainApp();
}

// Show Main App
function showMainApp() {
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('userDisplay').textContent = `👤 ${currentUser.username}`;
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('usernameModal').style.display = 'none';
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    cart = [];
    updateCartUI();
    location.reload();
}

// Render Products
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            &lt;img src="${product.image}" alt="${product.name}" class="product-image"&gt;
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">Rp${formatPrice(product.price)}</div>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
                    <input type="number" class="quantity-input" id="qty-${product.id}" value="1" min="1" max="${product.stock}">
                    <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">Tambah ke Keranjang</button>
            </div>
        </div>
    `).join('');
}

// Format Price
function formatPrice(price) {
    return price.toLocaleString('id-ID');
}

// Change Quantity
function changeQuantity(productId, delta) {
    const input = document.getElementById(`qty-${productId}`);
    let value = parseInt(input.value) + delta;
    const product = products.find(p => p.id === productId);
    
    if (value < 1) value = 1;
    if (value > product.stock) value = product.stock;
    
    input.value = value;
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    updateCartUI();
    toggleCart();
}

// Update Cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align:center;color:#86868b;">Keranjang kosong</p>';
        cartTotal.textContent = 'Rp0';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            &lt;img src="${item.image}" alt="${item.name}"&gt;
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">Rp${formatPrice(item.price)} × ${item.quantity}</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Hapus</button>
                </div>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Rp${formatPrice(total)}`;
}

// Update Cart Quantity
function updateCartQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartUI();
        }
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

// Toggle Cart
function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('open');
}

// Open Checkout
function openCheckout() {
    if (cart.length === 0) {
        alert('Keranjang masih kosong!');
        return;
    }
    
    const checkoutItems = document.getElementById('checkoutItems');
    checkoutItems.innerHTML = cart.map(item => `
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e5e5;">
            <span>${item.name} × ${item.quantity}</span>
            <span>Rp${formatPrice(item.price * item.quantity)}</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkoutTotal').textContent = `Rp${formatPrice(total)}`;
    
    document.getElementById('checkoutModal').style.display = 'flex';
}

// Process Checkout
function processCheckout() {
    const targetPhone = document.getElementById('targetPhone').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (!targetPhone) {
        alert('Nomor WhatsApp target wajib diisi!');
        return;
    }
    
    if (!paymentMethod) {
        alert('Metode pembayaran wajib dipilih!');
        return;
    }
    
    // Build WhatsApp message
    let message = 'Hallo, saya ingin membeli produk ini\n\n';
    cart.forEach(item => {
        message += `- Nama produk: ${item.name}\n`;
        message += `- Jumlah: ${item.quantity}\n`;
        message += `- Harga: Rp${formatPrice(item.price * item.quantity)}\n\n`;
    });
    message += `- Metode Pembayaran: ${paymentMethod}\n`;
    message += `- Total: Rp${formatPrice(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0))}\n`;
    message += `- Username: ${currentUser.username}\n`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp
    const whatsappNumber = '6285862364581';
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // Clear cart after checkout
    cart = [];
    updateCartUI();
    document.getElementById('checkoutModal').style.display = 'none';
    alert('Pesanan Anda telah dibuat! Silakan lanjutkan pembayaran di WhatsApp.');
}

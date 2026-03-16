/* ============================================
   DFCOMMERCE - MODERN E-COMMERCE FRONTEND
   Production-Ready JavaScript Application
   ============================================ */

// State Management
const state = {
    token: localStorage.getItem('dfcommerce_token') || '',
    user: JSON.parse(localStorage.getItem('dfcommerce_user') || 'null'),
    products: [],
    categories: [],
    cart: [],
    orders: [],
    filters: {
        search: '',
        category: '',
        inStock: false,
    }
};

// API Base URL
const API_URL = window.location.origin;

// DOM Elements
const elements = {
    // Auth
    authModal: document.getElementById('auth-modal'),
    modalClose: document.getElementById('modal-close'),
    authTabs: document.querySelectorAll('.tab-button'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    
    // Header
    sessionStatus: document.getElementById('session-status'),
    adminButton: document.getElementById('admin-button'),
    logoutButton: document.getElementById('logout-button'),
    
    // Products
    productsGrid: document.getElementById('products-grid'),
    categorySections: document.getElementById('category-sections'),
    searchInput: document.getElementById('search-input'),
    categorySelect: document.getElementById('category-select'),
    stockInput: document.getElementById('stock-input'),
    filterApply: document.getElementById('filter-apply'),
    clearFilters: document.getElementById('clear-filters-button'),
    
    // Cart
    cartList: document.getElementById('cart-list'),
    cartTotal: document.getElementById('cart-total'),
    checkoutButton: document.getElementById('checkout-button'),
    clearCartButton: document.getElementById('clear-cart-button'),
    
    // Orders
    ordersList: document.getElementById('orders-list'),
    ordersNav: document.getElementById('orders-nav'),
    
    // Admin
    adminPanel: document.getElementById('admin-panel'),
    productForm: document.getElementById('product-form'),
    
    // UI
    toast: document.getElementById('toast'),
    statsProducts: document.getElementById('stat-products'),
    statsCategories: document.getElementById('stat-categories'),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    setTimeout(() => {
        elements.toast.classList.add('hidden');
    }, 3000);
}

async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (state.token) {
        headers.Authorization = `Bearer ${state.token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

function saveAuthState() {
    localStorage.setItem('dfcommerce_token', state.token);
    localStorage.setItem('dfcommerce_user', JSON.stringify(state.user));
}

function clearAuthState() {
    state.token = '';
    state.user = null;
    localStorage.removeItem('dfcommerce_token');
    localStorage.removeItem('dfcommerce_user');
}

function updateSessionUI() {
    if (state.user) {
        elements.sessionStatus.textContent = state.user.username;
        elements.logoutButton.classList.remove('hidden');
        elements.adminButton.classList.toggle('hidden', !state.user.is_admin);
    } else {
        elements.sessionStatus.textContent = 'Guest';
        elements.logoutButton.classList.add('hidden');
        elements.adminButton.classList.add('hidden');
    }
}

// ============================================
// AUTHENTICATION
// ============================================

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username: formData.get('username'),
                password: formData.get('password'),
            }),
        });

        state.token = response.access_token;
        
        // Get user info
        const user = await apiCall('/auth/me');
        state.user = user;
        saveAuthState();
        updateSessionUI();
        closeAuthModal();
        loadCart();
        loadOrders();
        showToast('Welcome back!');
    } catch (error) {
        console.error('Login error:', error);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: formData.get('email'),
                username: formData.get('username'),
                full_name: formData.get('full_name'),
                password: formData.get('password'),
            }),
        });

        showToast('Account created! Logging you in...');
        document.getElementById('login-form').elements['username'].value = formData.get('username');
        document.getElementById('login-form').elements['password'].value = formData.get('password');
        await handleLogin(new Event('submit', { target: document.getElementById('login-form') }));
        e.target.reset();
    } catch (error) {
        console.error('Registration error:', error);
    }
}

function handleLogout() {
    clearAuthState();
    state.cart = [];
    state.orders = [];
    updateSessionUI();
    renderCart();
    renderOrders();
    showToast('Logged out successfully');
}

// ============================================
// AUTH MODAL
// ============================================

function openAuthModal() {
    elements.authModal.classList.remove('hidden');
}

function closeAuthModal() {
    elements.authModal.classList.add('hidden');
}

// ============================================
// PRODUCTS
// ============================================

async function loadProducts() {
    try {
        const params = new URLSearchParams({
            skip: 0,
            limit: 100,
            search: state.filters.search,
            category: state.filters.category,
            in_stock: state.filters.inStock,
        });

        const products = await apiCall(`/products/?${params}`);
        state.products = products;
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadCategories() {
    try {
        const categories = await apiCall('/products/categories');
        state.categories = categories;
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function setupCarouselListeners() {
    // Carousel navigation
    document.querySelectorAll('.carousel-nav').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            const track = document.querySelector(`.carousel-track[data-category="${category}"]`);
            
            if (e.target.classList.contains('prev')) {
                track.scrollBy({ left: -300, behavior: 'smooth' });
            } else {
                track.scrollBy({ left: 300, behavior: 'smooth' });
            }
        });
    });
}

function renderProducts() {
    // Show grid view if filters are active
    const hasActiveFilters = state.filters.search || state.filters.category;
    
    if (hasActiveFilters) {
        // Filtered view - show grid
        elements.productsGrid.classList.remove('hidden');
        elements.categorySections.innerHTML = '';
        
        elements.productsGrid.innerHTML = state.products.map(product => {
            const isEmoji = product.image_url && product.image_url.length < 5 && /\p{Emoji}/u.test(product.image_url);
            const imageHTML = isEmoji 
                ? `<div style="font-size: 2.5rem; display: flex; align-items: center; justify-content: center; height: 100%;">${product.image_url}</div>`
                : product.image_url 
                ? `<img src="${product.image_url}" alt="${product.name}">`
                : '📦';
            
            return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">${imageHTML}</div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-footer">
                        <div>
                            <div class="product-price">$${product.price.toFixed(2)}</div>
                            <div class="product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                                ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </div>
                        </div>
                        <button class="primary-button add-to-cart" data-product-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                            Add
                        </button>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    } else {
        // Browse view - show categories with carousels
        elements.productsGrid.classList.add('hidden');
        renderCategoryCarousels();
    }
    
    // Update stats
    elements.statsProducts.textContent = state.products.length;
    
    // Add event listeners
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });
}

function renderCategoryCarousels() {
    // Group products by category
    const categories = {};
    
    state.products.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = [];
        }
        categories[product.category].push(product);
    });
    
    // Create carousel for each category
    let html = '';
    
    Object.entries(categories).forEach(([category, products]) => {
        html += `
            <div class="category-carousel-section">
                <div class="carousel-header">
                    <h2>${category}</h2>
                    <a href="#" class="view-all" data-category="${category}">See All ></a>
                </div>
                <div class="carousel-container">
                    <button class="carousel-nav prev" data-category="${category}">❮</button>
                    <div class="carousel-track" data-category="${category}">
                        ${products.map(product => {
                            const isEmoji = product.image_url && product.image_url.length < 5 && /\p{Emoji}/u.test(product.image_url);
                            const imageHTML = isEmoji 
                                ? `<div style="font-size: 2rem; display: flex; align-items: center; justify-content: center; height: 100%;">${product.image_url}</div>`
                                : product.image_url 
                                ? `<img src="${product.image_url}" alt="${product.name}">`
                                : '📦';
                            return `
                            <div class="carousel-item">
                                <div class="carousel-product-card">
                                    <div class="carousel-image">${imageHTML}</div>
                                    <div class="carousel-product-info">
                                        <h4 class="carousel-product-name" title="${product.name}">${product.name}</h4>
                                        <div class="carousel-price">$${product.price.toFixed(2)}</div>
                                        <div class="carousel-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                                            ${product.stock > 0 ? '✓ In Stock' : 'Out of Stock'}
                                        </div>
                                        <button class="carousel-add-to-cart add-to-cart" data-product-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        }).join('')}
                    </div>
                    <button class="carousel-nav next" data-category="${category}">❯</button>
                </div>
            </div>
        `;
    });
    
    elements.categorySections.innerHTML = html;
    
    // Add carousel event listeners
    setupCarouselListeners();
    
    // Add "See All" category link listeners
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            state.filters.category = category;
            state.filters.search = '';
            elements.searchInput.value = '';
            elements.categorySelect.value = category;
            loadProducts();
        });
    });
}

function renderCategories() {
    const options = state.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    elements.categorySelect.innerHTML = '<option value="">All categories</option>' + options;
    elements.statsCategories.textContent = state.categories.length;
}

async function handleAddToCart(e) {
    e.preventDefault();
    
    if (!state.user) {
        showToast('Please sign in first', 'error');
        openAuthModal();
        return;
    }

    const productId = parseInt(e.target.dataset.productId);
    
    try {
        await apiCall('/cart/add', {
            method: 'POST',
            body: JSON.stringify({
                product_id: productId,
                quantity: 1,
            }),
        });
        
        await loadCart();
        showToast('Added to cart!');
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// ============================================
// CART
// ============================================

async function loadCart() {
    if (!state.user) {
        state.cart = [];
        renderCart();
        return;
    }

    try {
        const cart = await apiCall('/cart/');
        state.cart = cart;
        renderCart();
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function renderCart() {
    if (state.cart.length === 0) {
        elements.cartList.innerHTML = '<div class="empty-state">Your cart is empty</div>';
        elements.checkoutButton.disabled = true;
        elements.cartTotal.textContent = '$0.00';
        return;
    }

    let total = 0;
    elements.cartList.innerHTML = state.cart.map(item => {
        const itemTotal = item.product.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.product.name}</div>
                    <div class="cart-item-details">Qty: ${item.quantity}</div>
                </div>
                <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                <button class="cart-item-remove" data-item-id="${item.id}" title="Remove">×</button>
            </div>
        `;
    }).join('');

    elements.cartTotal.textContent = `$${total.toFixed(2)}`;
    elements.checkoutButton.disabled = false;

    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', handleRemoveFromCart);
    });
}

async function handleRemoveFromCart(e) {
    const itemId = parseInt(e.target.dataset.itemId);
    
    try {
        await apiCall(`/cart/${itemId}`, {
            method: 'DELETE',
        });
        
        await loadCart();
        showToast('Item removed from cart');
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

async function handleCheckout() {
    if (!state.user) {
        showToast('Please sign in to checkout', 'error');
        openAuthModal();
        return;
    }

    if (state.cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }

    try {
        const order = await apiCall('/orders/from-cart', {
            method: 'POST',
        });
        
        state.cart = [];
        await loadCart();
        await loadOrders();
        showToast(`Order #${order.id} placed successfully!`);
    } catch (error) {
        console.error('Checkout error:', error);
    }
}

// ============================================
// ORDERS
// ============================================

async function loadOrders() {
    if (!state.user) {
        state.orders = [];
        renderOrders();
        return;
    }

    try {
        const orders = await apiCall('/orders/');
        state.orders = orders;
        renderOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function renderOrders() {
    const container = elements.ordersList;
    
    if (state.orders.length === 0) {
        container.innerHTML = '<div class="empty-state">No orders yet</div>';
        return;
    }

    container.innerHTML = state.orders.map(order => `
        <div class="order-item">
            <div class="cart-item-info">
                <div class="cart-item-name">Order #${order.id}</div>
                <div class="cart-item-details">${new Date(order.created_at).toLocaleDateString()}</div>
                <div class="cart-item-details">Status: <strong>${order.status}</strong></div>
            </div>
            <div class="cart-item-price">$${order.total_price.toFixed(2)}</div>
        </div>
    `).join('');
}

// ============================================
// FILTERS
// ============================================

function applyFilters() {
    state.filters.search = elements.searchInput.value;
    state.filters.category = elements.categorySelect.value;
    state.filters.inStock = elements.stockInput.checked;
    loadProducts();
}

function clearFiltersForm() {
    elements.searchInput.value = '';
    elements.categorySelect.value = '';
    elements.stockInput.checked = false;
    state.filters = {
        search: '',
        category: '',
        inStock: false,
    };
    loadProducts();
}

// ============================================
// ADMIN
// ============================================

async function handleAddProduct(e) {
    e.preventDefault();
    
    if (!state.user?.is_admin) {
        showToast('Admin access required', 'error');
        return;
    }

    const formData = new FormData(e.target);
    
    try {
        await apiCall('/products/', {
            method: 'POST',
            body: JSON.stringify({
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                stock: parseInt(formData.get('stock')),
                category: formData.get('category'),
                image_url: formData.get('image_url') || null,
            }),
        });
        
        e.target.reset();
        await loadProducts();
        showToast('Product added successfully!');
    } catch (error) {
        console.error('Error adding product:', error);
    }
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    // Load initial data
    await loadCategories();
    await loadProducts();
    
    // Restore session
    updateSessionUI();
    if (state.user) {
        await loadCart();
        await loadOrders();
    }

    // Event listeners - Auth
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    elements.logoutButton.addEventListener('click', handleLogout);
    elements.modalClose.addEventListener('click', closeAuthModal);
    
    // Auth tabs
    elements.authTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
        });
    });

    // Click session status to open auth modal
    elements.sessionStatus.addEventListener('click', () => {
        if (!state.user) {
            openAuthModal();
        }
    });

    // Event listeners - Filters
    elements.filterApply.addEventListener('click', applyFilters);
    elements.clearFilters.addEventListener('click', clearFiltersForm);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });

    // Event listeners - Cart
    elements.clearCartButton.addEventListener('click', async () => {
        if (confirm('Clear cart? This cannot be undone.')) {
            try {
                await apiCall('/cart/', {
                    method: 'DELETE',
                });
                await loadCart();
                showToast('Cart cleared');
            } catch (error) {
                console.error('Error clearing cart:', error);
            }
        }
    });
    
    elements.checkoutButton.addEventListener('click', handleCheckout);

    // Event listeners - Admin
    if (elements.productForm) {
        elements.productForm.addEventListener('submit', handleAddProduct);
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

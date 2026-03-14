const state = {
    token: localStorage.getItem("dfc_token") || "",
    user: JSON.parse(localStorage.getItem("dfc_user") || "null"),
    products: [],
    categories: [],
    cart: [],
    orders: [],
    adminOrders: [],
    adminProducts: [],
    selectedProductId: null,
    editingProductId: null,
    filters: {
        search: "",
        category: "",
        inStock: false,
        minPrice: "",
        maxPrice: "",
        sortBy: "latest",
    },
};

const nodes = {
    sessionStatus: document.getElementById("session-status"),
    logoutButton: document.getElementById("logout-button"),
    authForms: document.getElementById("auth-forms"),
    accountSummary: document.getElementById("account-summary"),
    loginForm: document.getElementById("login-form"),
    registerForm: document.getElementById("register-form"),
    filtersForm: document.getElementById("filters-form"),
    categorySelect: document.getElementById("category-select"),
    searchInput: document.getElementById("search-input"),
    stockInput: document.getElementById("stock-input"),
    minPriceInput: document.getElementById("min-price-input"),
    maxPriceInput: document.getElementById("max-price-input"),
    sortSelect: document.getElementById("sort-select"),
    filterResults: document.getElementById("filter-results"),
    productsGrid: document.getElementById("products-grid"),
    cartList: document.getElementById("cart-list"),
    cartTotal: document.getElementById("cart-total"),
    cartMeta: document.getElementById("cart-meta"),
    checkoutButton: document.getElementById("checkout-button"),
    clearCartButton: document.getElementById("clear-cart-button"),
    ordersList: document.getElementById("orders-list"),
    adminPanel: document.getElementById("admin-panel"),
    productForm: document.getElementById("product-form"),
    productFormTitle: document.getElementById("product-form-title"),
    productSubmitButton: document.getElementById("product-submit-button"),
    productCancelButton: document.getElementById("product-cancel-button"),
    adminOrdersList: document.getElementById("admin-orders-list"),
    adminProductsList: document.getElementById("admin-products-list"),
    clearFiltersButton: document.getElementById("clear-filters-button"),
    toast: document.getElementById("toast"),
    statProducts: document.getElementById("stat-products"),
    statCategories: document.getElementById("stat-categories"),
    statOrders: document.getElementById("stat-orders"),
    productModal: document.getElementById("product-modal"),
    modalMedia: document.getElementById("modal-media"),
    modalCategory: document.getElementById("modal-category"),
    modalProductName: document.getElementById("modal-product-name"),
    modalDescription: document.getElementById("modal-description"),
    modalPrice: document.getElementById("modal-price"),
    modalStock: document.getElementById("modal-stock"),
    modalQty: document.getElementById("modal-qty"),
    modalAddCart: document.getElementById("modal-add-cart"),
    modalBuyNow: document.getElementById("modal-buy-now"),
    checkoutModal: document.getElementById("checkout-modal"),
    checkoutSummary: document.getElementById("checkout-summary"),
    checkoutTotal: document.getElementById("checkout-total"),
    confirmCheckoutButton: document.getElementById("confirm-checkout-button"),
};

// ---- Utilities ----

function showToast(message, isError = false) {
    nodes.toast.textContent = message;
    nodes.toast.style.background = isError ? "#8f2f2b" : "#1f1a17";
    nodes.toast.classList.remove("hidden");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
        nodes.toast.classList.add("hidden");
    }, 3200);
}

async function api(path, { method = "GET", body, headers = {} } = {}) {
    const finalHeaders = { ...headers };
    let finalBody = body;

    if (state.token) {
        finalHeaders.Authorization = `Bearer ${state.token}`;
    }

    if (body && !(body instanceof FormData) && !finalHeaders["Content-Type"]) {
        finalHeaders["Content-Type"] = "application/json";
        finalBody = JSON.stringify(body);
    }

    const response = await fetch(path, {
        method,
        headers: finalHeaders,
        body: finalBody,
    });

    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.detail || "Request failed");
    }
    return data;
}

function currency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value || 0);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function saveSession() {
    localStorage.setItem("dfc_token", state.token || "");
    localStorage.setItem("dfc_user", JSON.stringify(state.user || null));
}

function clearSession() {
    state.token = "";
    state.user = null;
    state.cart = [];
    state.orders = [];
    state.adminOrders = [];
    state.adminProducts = [];
    localStorage.removeItem("dfc_token");
    localStorage.removeItem("dfc_user");
}

function setEmptyState(element, message) {
    element.classList.add("muted-state");
    element.innerHTML = message;
}

function setFilledState(element, content) {
    element.classList.remove("muted-state");
    element.innerHTML = content;
}

function getInitials(name) {
    return String(name || "?")
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || "")
        .join("");
}

function makePlaceholderImage(label, size = 200) {
    const initials = getInitials(label);
    const palettes = [
        ["#c35f2d", "#de9350"],
        ["#2f6b47", "#54985f"],
        ["#4a5568", "#718096"],
        ["#744210", "#d97706"],
        ["#553c9a", "#805ad5"],
    ];
    const idx = Math.abs((label.charCodeAt(0) || 0) + (label.charCodeAt(1) || 0)) % palettes.length;
    const [from, to] = palettes[idx];
    const fs = Math.round(size * 0.35);
    const svg = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
        `<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">`,
        `<stop offset="0%" stop-color="${from}"/>`,
        `<stop offset="100%" stop-color="${to}"/>`,
        `</linearGradient></defs>`,
        `<rect width="${size}" height="${size}" fill="url(#g)"/>`,
        `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white"`,
        ` font-size="${fs}" font-family="Space Grotesk,sans-serif" font-weight="700">${escapeHtml(initials)}</text>`,
        `</svg>`,
    ].join("");
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function getProductImage(product) {
    return product?.image_url || makePlaceholderImage(product?.name || "Product");
}

function updateActionStates() {
    nodes.checkoutButton.disabled = !state.user || state.cart.length === 0;
    nodes.clearCartButton.disabled = !state.user || state.cart.length === 0;
}

// ---- Modals ----

function openModal(modalEl) {
    modalEl.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

function closeModal(modalEl) {
    modalEl.classList.add("hidden");
    if (nodes.productModal.classList.contains("hidden") && nodes.checkoutModal.classList.contains("hidden")) {
        document.body.classList.remove("modal-open");
    }
}

// ---- Render functions ----

function renderSession() {
    if (state.user) {
        nodes.sessionStatus.textContent = `${state.user.full_name} @ ${state.user.username}${state.user.is_admin ? " · admin" : ""}`;
        nodes.logoutButton.classList.remove("hidden");
        nodes.authForms.classList.add("hidden");
        nodes.accountSummary.classList.remove("hidden");
        nodes.accountSummary.innerHTML = `
            <div class="summary-chip">
                <strong>${escapeHtml(state.user.full_name)}</strong>
                <span>${escapeHtml(state.user.email)}</span>
            </div>
            <div class="summary-chip">
                <strong>Account role</strong>
                <span>${state.user.is_admin ? "Administrator" : "Customer"}</span>
            </div>
            <div class="summary-chip">
                <strong>Status</strong>
                <span>${state.user.is_active ? "Active" : "Inactive"}</span>
            </div>
        `;
    } else {
        nodes.sessionStatus.textContent = "Guest session";
        nodes.logoutButton.classList.add("hidden");
        nodes.authForms.classList.remove("hidden");
        nodes.accountSummary.classList.add("hidden");
        nodes.accountSummary.innerHTML = "";
    }
    nodes.adminPanel.classList.toggle("hidden", !state.user?.is_admin);
    updateActionStates();
}

function renderProducts() {
    nodes.statProducts.textContent = String(state.products.length);
    nodes.statCategories.textContent = String(state.categories.length);
    if (nodes.filterResults) {
        nodes.filterResults.textContent = state.products.length
            ? `${state.products.length} product${state.products.length !== 1 ? "s" : ""} found`
            : "";
    }

    if (!state.products.length) {
        nodes.productsGrid.innerHTML = '<div class="muted-state">No products matched the current filters.</div>';
        return;
    }

    nodes.productsGrid.innerHTML = state.products.map((product) => {
        const imgUrl = getProductImage(product);
        const outOfStock = product.stock < 1;
        const adminBtns = state.user?.is_admin
            ? `<button class="ghost-button" type="button" onclick="editProduct(${product.id})">Edit</button>
               <button class="ghost-button" type="button" onclick="deleteProduct(${product.id})">Delete</button>`
            : "";
        return `
        <article class="product-card">
            <div class="product-media" style="background-image:url('${encodeURI(imgUrl)}')" role="img" aria-label="${escapeHtml(product.name)}"></div>
            <div class="product-top">
                <div>
                    <h3>${escapeHtml(product.name)}</h3>
                    <p class="product-meta">${escapeHtml(product.description)}</p>
                </div>
                <span class="price-pill">${currency(product.price)}</span>
            </div>
            <div class="product-actions">
                <span class="category-pill">${escapeHtml(product.category || "General")}</span>
                <span class="list-meta">${outOfStock ? "Out of stock" : `Stock: ${product.stock}`}</span>
            </div>
            <div class="product-actions product-actions-stretch">
                <label class="quantity-field">
                    <span>Qty</span>
                    <input id="product-qty-${product.id}" type="number" min="1" max="${Math.max(product.stock, 1)}" step="1" value="1" ${outOfStock ? "disabled" : ""}>
                </label>
                <button class="primary-button" type="button" onclick="addToCart(${product.id})" ${outOfStock ? "disabled" : ""}>Add to cart</button>
                <button class="ghost-button" type="button" onclick="openProductModal(${product.id})">Details</button>
                ${adminBtns}
            </div>
        </article>`;
    }).join("");
}

function renderProductModal(productId) {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return;
    state.selectedProductId = productId;
    const imgUrl = getProductImage(product);
    nodes.modalMedia.style.backgroundImage = `url('${encodeURI(imgUrl)}')`;
    nodes.modalCategory.textContent = product.category || "General";
    nodes.modalProductName.textContent = product.name;
    nodes.modalDescription.textContent = product.description;
    nodes.modalPrice.textContent = currency(product.price);
    nodes.modalStock.textContent = product.stock < 1 ? "Out of stock" : `${product.stock} in stock`;
    nodes.modalQty.max = String(Math.max(product.stock, 1));
    nodes.modalQty.value = "1";
    nodes.modalQty.disabled = product.stock < 1;
    nodes.modalAddCart.disabled = product.stock < 1;
    nodes.modalBuyNow.disabled = product.stock < 1;
    openModal(nodes.productModal);
}

function renderCategories() {
    const currentValue = state.filters.category;
    nodes.categorySelect.innerHTML = [
        '<option value="">All categories</option>',
        ...state.categories.map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`),
    ].join("");
    nodes.categorySelect.value = currentValue;
}

function renderCart() {
    if (!state.user) {
        setEmptyState(nodes.cartList, "Sign in to manage a cart.");
        nodes.cartTotal.textContent = "Total: $0.00";
        if (nodes.cartMeta) nodes.cartMeta.textContent = "Your selected items stay in sync with the API.";
        updateActionStates();
        return;
    }
    if (!state.cart.length) {
        setEmptyState(nodes.cartList, "Your cart is empty. Add products to get started.");
        nodes.cartTotal.textContent = "Total: $0.00";
        if (nodes.cartMeta) nodes.cartMeta.textContent = "Add products to start shopping.";
        updateActionStates();
        return;
    }
    const total = state.cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    nodes.cartTotal.textContent = `Total: ${currency(total)}`;
    if (nodes.cartMeta) {
        nodes.cartMeta.textContent = `${state.cart.length} item${state.cart.length !== 1 ? "s" : ""} in cart`;
    }
    setFilledState(nodes.cartList, state.cart.map((item) => `
        <article class="list-item">
            <div class="item-top">
                <div>
                    <h3>${escapeHtml(item.product.name)}</h3>
                    <p class="item-meta">${escapeHtml(item.product.category || "")} &middot; ${currency(item.product.price)} each</p>
                </div>
                <span class="price-pill">${currency(item.quantity * item.product.price)}</span>
            </div>
            <div class="item-actions">
                <input type="number" min="1" max="${Math.max(item.product.stock, 1)}" step="1" value="${item.quantity}" onchange="changeCartQuantity(${item.id}, this.value)">
                <button class="ghost-button" type="button" onclick="removeCartItem(${item.id})">Remove</button>
            </div>
        </article>
    `).join(""));
    updateActionStates();
}

function renderCheckoutSummary() {
    if (!state.cart.length) return;
    const total = state.cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    nodes.checkoutTotal.textContent = currency(total);
    setFilledState(nodes.checkoutSummary, state.cart.map((item) => `
        <article class="list-item">
            <div class="item-top">
                <div>
                    <h3>${escapeHtml(item.product.name)}</h3>
                    <p class="item-meta">${escapeHtml(item.product.category || "")} &middot; Qty ${item.quantity}</p>
                </div>
                <span class="price-pill">${currency(item.quantity * item.product.price)}</span>
            </div>
        </article>
    `).join(""));
}

function renderOrders() {
    if (!state.user) {
        setEmptyState(nodes.ordersList, "Sign in to view orders.");
        return;
    }
    if (!state.orders.length) {
        setEmptyState(nodes.ordersList, "No orders yet.");
        return;
    }
    if (nodes.statOrders) nodes.statOrders.textContent = String(state.orders.length);
    setFilledState(nodes.ordersList, state.orders.map((order) => {
        const itemsLine = order.items
            .map((item) => `${escapeHtml(item.product?.name || ("Product #" + item.product_id))} x${item.quantity}`)
            .join(", ") || "No items";
        return `
        <article class="order-card">
            <div class="order-top">
                <div>
                    <h3>Order #${order.id}</h3>
                    <p class="item-meta">${new Date(order.created_at).toLocaleString()}</p>
                </div>
                <span class="status-pill">${escapeHtml(order.status)}</span>
            </div>
            <div class="list-meta">${itemsLine}</div>
            <div class="list-meta">Total: ${currency(order.total_price)}</div>
        </article>`;
    }).join(""));
}

function renderAdminOrders() {
    if (!state.user?.is_admin) {
        setEmptyState(nodes.adminOrdersList, "Admin access required.");
        return;
    }
    if (!state.adminOrders.length) {
        setEmptyState(nodes.adminOrdersList, "No orders available.");
        return;
    }
    setFilledState(nodes.adminOrdersList, state.adminOrders.map((order) => `
        <article class="order-card">
            <div class="order-top">
                <div>
                    <h3>Order #${order.id}</h3>
                    <p class="item-meta">User ${order.user_id} &middot; ${new Date(order.created_at).toLocaleString()}</p>
                </div>
                <span class="price-pill">${currency(order.total_price)}</span>
            </div>
            <div class="order-actions">
                <select onchange="updateOrderStatus(${order.id}, this.value)">
                    ${["pending", "processing", "shipped", "completed", "cancelled"].map((s) =>
                        `<option value="${s}" ${order.status === s ? "selected" : ""}>${s}</option>`
                    ).join("")}
                </select>
                <span class="status-pill">${escapeHtml(order.status)}</span>
            </div>
        </article>
    `).join(""));
}

function renderAdminProducts() {
    if (!state.user?.is_admin) {
        setEmptyState(nodes.adminProductsList, "Admin access required.");
        return;
    }
    if (!state.adminProducts.length) {
        setEmptyState(nodes.adminProductsList, "No products available.");
        return;
    }
    setFilledState(nodes.adminProductsList, state.adminProducts.map((product) => `
        <article class="list-item">
            <div class="item-top">
                <div>
                    <h3>${escapeHtml(product.name)}</h3>
                    <p class="item-meta">${escapeHtml(product.category)} &middot; Stock ${product.stock}</p>
                </div>
                <span class="price-pill">${currency(product.price)}</span>
            </div>
            <div class="item-actions">
                <button class="ghost-button" type="button" onclick="editProduct(${product.id})">Edit</button>
                <button class="ghost-button" type="button" onclick="deleteProduct(${product.id})">Delete</button>
            </div>
        </article>
    `).join(""));
}

// ---- Admin form management ----

function populateProductForm(product) {
    state.editingProductId = product.id;
    nodes.productFormTitle.textContent = "Edit product";
    nodes.productSubmitButton.textContent = "Save changes";
    nodes.productCancelButton.classList.remove("hidden");
    const form = nodes.productForm;
    form.elements.name.value = product.name;
    form.elements.description.value = product.description;
    form.elements.price.value = String(product.price);
    form.elements.stock.value = String(product.stock);
    form.elements.category.value = product.category || "";
    form.elements.image_url.value = product.image_url || "";
    nodes.adminPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    form.elements.name.focus();
}

function resetProductForm() {
    state.editingProductId = null;
    nodes.productFormTitle.textContent = "Add product";
    nodes.productSubmitButton.textContent = "Create product";
    nodes.productCancelButton.classList.add("hidden");
    nodes.productForm.reset();
}

function syncFilterInputs() {
    nodes.searchInput.value = state.filters.search;
    nodes.categorySelect.value = state.filters.category;
    nodes.stockInput.checked = state.filters.inStock;
    nodes.minPriceInput.value = state.filters.minPrice;
    nodes.maxPriceInput.value = state.filters.maxPrice;
    nodes.sortSelect.value = state.filters.sortBy;
}

// ---- Data loading ----

async function loadProducts() {
    const params = new URLSearchParams();
    if (state.filters.search) params.set("search", state.filters.search);
    if (state.filters.category) params.set("category", state.filters.category);
    if (state.filters.inStock) params.set("in_stock", "true");
    if (state.filters.minPrice !== "") params.set("min_price", String(state.filters.minPrice));
    if (state.filters.maxPrice !== "") params.set("max_price", String(state.filters.maxPrice));
    if (state.filters.sortBy) params.set("sort_by", state.filters.sortBy);
    const query = params.toString();
    state.products = await api(`/products/${query ? "?" + query : ""}`);
    renderProducts();
}

async function loadCategories() {
    state.categories = await api("/products/categories");
    renderCategories();
}

async function loadSession() {
    if (!state.token) {
        clearSession();
        renderSession();
        renderCart();
        renderOrders();
        renderAdminOrders();
        return;
    }
    try {
        state.user = await api("/auth/me");
        saveSession();
        renderSession();
        await Promise.all([loadCart(), loadOrders(), loadAdminOrdersIfNeeded(), loadAdminProductsIfNeeded()]);
    } catch (error) {
        clearSession();
        renderSession();
        renderCart();
        renderOrders();
        renderAdminOrders();
        renderAdminProducts();
        showToast(error.message, true);
    }
}

async function loadCart() {
    if (!state.user) { state.cart = []; renderCart(); return; }
    state.cart = await api("/cart/");
    renderCart();
}

async function loadOrders() {
    if (!state.user) { state.orders = []; renderOrders(); return; }
    state.orders = await api("/orders/");
    renderOrders();
}

async function loadAdminOrdersIfNeeded() {
    if (!state.user?.is_admin) { state.adminOrders = []; renderAdminOrders(); return; }
    state.adminOrders = await api("/orders/all");
    renderAdminOrders();
}

async function loadAdminProductsIfNeeded() {
    if (!state.user?.is_admin) { state.adminProducts = []; renderAdminProducts(); return; }
    state.adminProducts = await api("/products/?sort_by=name&limit=100");
    renderAdminProducts();
}

async function refreshAfterOrderChange() {
    await Promise.all([loadCart(), loadOrders(), loadProducts(), loadAdminOrdersIfNeeded()]);
}

async function submitDirectOrder(items) {
    if (!state.user) { showToast("Sign in to place an order.", true); return; }
    try {
        await api("/orders/", { method: "POST", body: { items } });
        await refreshAfterOrderChange();
        showToast("Order placed successfully!");
    } catch (error) {
        showToast(error.message, true);
    }
}

// ---- Event listeners ----

nodes.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(nodes.loginForm);
    try {
        const tokenData = await api("/auth/login", {
            method: "POST",
            body: new URLSearchParams({
                username: String(form.get("username") || ""),
                password: String(form.get("password") || ""),
            }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        state.token = tokenData.access_token;
        await loadSession();
        nodes.loginForm.reset();
        showToast("Signed in successfully.");
    } catch (error) {
        showToast(error.message, true);
    }
});

nodes.registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(nodes.registerForm);
    try {
        await api("/auth/register", {
            method: "POST",
            body: {
                email: String(form.get("email") || ""),
                username: String(form.get("username") || ""),
                full_name: String(form.get("full_name") || ""),
                password: String(form.get("password") || ""),
            },
        });
        nodes.registerForm.reset();
        showToast("Account created. You can sign in now.");
    } catch (error) {
        showToast(error.message, true);
    }
});

nodes.logoutButton.addEventListener("click", () => {
    clearSession();
    renderSession();
    renderCart();
    renderOrders();
    renderAdminOrders();
    renderAdminProducts();
    showToast("Logged out.");
});

nodes.filtersForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    state.filters.search = nodes.searchInput.value.trim();
    state.filters.category = nodes.categorySelect.value;
    state.filters.inStock = nodes.stockInput.checked;
    state.filters.minPrice = nodes.minPriceInput.value.trim();
    state.filters.maxPrice = nodes.maxPriceInput.value.trim();
    state.filters.sortBy = nodes.sortSelect.value;
    try { await loadProducts(); } catch (e) { showToast(e.message, true); }
});

nodes.clearFiltersButton.addEventListener("click", async () => {
    state.filters = { search: "", category: "", inStock: false, minPrice: "", maxPrice: "", sortBy: "latest" };
    syncFilterInputs();
    try { await loadProducts(); } catch (e) { showToast(e.message, true); }
});

nodes.checkoutButton.addEventListener("click", () => {
    if (!state.user) { showToast("Sign in before checking out.", true); return; }
    if (!state.cart.length) { showToast("Your cart is empty.", true); return; }
    renderCheckoutSummary();
    openModal(nodes.checkoutModal);
});

nodes.clearCartButton.addEventListener("click", async () => {
    if (!state.user || !state.cart.length) return;
    try {
        await api("/cart/", { method: "DELETE" });
        await loadCart();
        showToast("Cart cleared.");
    } catch (e) { showToast(e.message, true); }
});

nodes.confirmCheckoutButton.addEventListener("click", async () => {
    closeModal(nodes.checkoutModal);
    try {
        await api("/orders/from-cart", { method: "POST" });
        await refreshAfterOrderChange();
        showToast("Order placed! Check your orders below.");
    } catch (e) { showToast(e.message, true); }
});

nodes.productForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(nodes.productForm);
    const payload = {
        name: String(form.get("name") || ""),
        description: String(form.get("description") || ""),
        price: Number(form.get("price") || 0),
        stock: Number(form.get("stock") || 0),
        category: String(form.get("category") || ""),
        image_url: String(form.get("image_url") || "") || null,
    };
    try {
        if (state.editingProductId) {
            await api(`/products/${state.editingProductId}`, { method: "PUT", body: payload });
            showToast("Product updated.");
        } else {
            await api("/products/", { method: "POST", body: payload });
            showToast("Product created.");
        }
        resetProductForm();
        await Promise.all([loadProducts(), loadCategories(), loadAdminProductsIfNeeded()]);
    } catch (e) { showToast(e.message, true); }
});

nodes.productCancelButton.addEventListener("click", () => resetProductForm());

// Product modal
nodes.productModal.addEventListener("click", (event) => {
    if (event.target === nodes.productModal) closeModal(nodes.productModal);
});
nodes.productModal.querySelector(".modal-close").addEventListener("click", () => {
    closeModal(nodes.productModal);
});
nodes.modalAddCart.addEventListener("click", () => {
    const qty = Number(nodes.modalQty.value);
    if (state.selectedProductId) {
        closeModal(nodes.productModal);
        addToCart(state.selectedProductId, qty);
    }
});
nodes.modalBuyNow.addEventListener("click", () => {
    const qty = Number(nodes.modalQty.value);
    if (state.selectedProductId) {
        closeModal(nodes.productModal);
        buyNow(state.selectedProductId, qty);
    }
});

// Checkout modal
nodes.checkoutModal.addEventListener("click", (event) => {
    if (event.target === nodes.checkoutModal) closeModal(nodes.checkoutModal);
});
nodes.checkoutModal.querySelector(".modal-close").addEventListener("click", () => {
    closeModal(nodes.checkoutModal);
});
nodes.checkoutModal.querySelector(".checkout-modal-close").addEventListener("click", () => {
    closeModal(nodes.checkoutModal);
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!nodes.productModal.classList.contains("hidden")) closeModal(nodes.productModal);
    else if (!nodes.checkoutModal.classList.contains("hidden")) closeModal(nodes.checkoutModal);
});

// ---- Global window actions ----

window.openProductModal = function openProductModal(productId) {
    renderProductModal(productId);
};

window.addToCart = async function addToCart(productId, quantityOverride) {
    if (!state.user) { showToast("Sign in before adding to cart.", true); return; }
    const qtyInput = document.getElementById(`product-qty-${productId}`);
    const quantity = quantityOverride ?? Number(qtyInput?.value ?? 1);
    if (!Number.isFinite(quantity) || quantity < 1) { showToast("Quantity must be at least 1.", true); return; }
    try {
        await api("/cart/add", { method: "POST", body: { product_id: productId, quantity } });
        await loadCart();
        showToast("Added to cart.");
    } catch (e) { showToast(e.message, true); }
};

window.buyNow = async function buyNow(productId, quantity = 1) {
    if (!state.user) { showToast("Sign in to buy.", true); return; }
    if (!Number.isFinite(quantity) || quantity < 1) { showToast("Quantity must be at least 1.", true); return; }
    await submitDirectOrder([{ product_id: productId, quantity }]);
};

window.changeCartQuantity = async function changeCartQuantity(itemId, value) {
    const quantity = Number(value);
    if (!Number.isFinite(quantity) || quantity < 1) { await removeCartItem(itemId); return; }
    try {
        await api(`/cart/${itemId}?quantity=${quantity}`, { method: "PUT" });
        await loadCart();
        showToast("Cart updated.");
    } catch (e) { showToast(e.message, true); }
};

window.removeCartItem = async function removeCartItem(itemId) {
    try {
        await api(`/cart/${itemId}`, { method: "DELETE" });
        await loadCart();
        showToast("Item removed.");
    } catch (e) { showToast(e.message, true); }
};

window.editProduct = function editProduct(productId) {
    const product =
        state.adminProducts.find((p) => p.id === productId) ||
        state.products.find((p) => p.id === productId);
    if (!product) { showToast("Product not found.", true); return; }
    populateProductForm(product);
};

window.deleteProduct = async function deleteProduct(productId) {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
        await api(`/products/${productId}`, { method: "DELETE" });
        await Promise.all([loadProducts(), loadCategories(), loadAdminProductsIfNeeded()]);
        showToast("Product deleted.");
    } catch (e) { showToast(e.message, true); }
};

window.updateOrderStatus = async function updateOrderStatus(orderId, status) {
    try {
        await api(`/orders/${orderId}/status?new_status=${encodeURIComponent(status)}`, { method: "PUT" });
        await Promise.all([loadOrders(), loadAdminOrdersIfNeeded()]);
        showToast("Order status updated.");
    } catch (e) { showToast(e.message, true); }
};

// ---- Init ----

async function init() {
    renderSession();
    renderCart();
    renderOrders();
    renderAdminOrders();
    renderAdminProducts();
    try {
        await Promise.all([loadCategories(), loadProducts()]);
        await loadSession();
    } catch (e) { showToast(e.message, true); }
}

init();

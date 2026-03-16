# Asynchronous Operations in DFCommerce

## What is Asynchronous Code?

Asynchronous code allows operations to run **without blocking** the user interface. Instead of waiting for one operation to complete before moving to the next, async code starts an operation and continues executing other code while waiting for the result.

## Real-World Analogy

**Synchronous (Blocking):**
```
1. Order coffee ☕
2. Wait for coffee to be made (BLOCK - can't do anything)
3. Drink coffee
4. Leave cafe
```

**Asynchronous (Non-Blocking):**
```
1. Order coffee ☕
2. Go sit down (continue doing other things)
3. Cafe calls your name when ready
4. Get coffee and drink
5. Leave cafe
```

---

## Examples in DFCommerce

### 1️⃣ **Login Operation** (Async + Sequential Operations)

```javascript
async function handleLogin(e) {
    try {
        // Step 1: Send login request (ASYNC - wait for response)
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username: formData.get('username'),
                password: formData.get('password'),
            }),
        });
        
        state.token = response.access_token;
        
        // Step 2: Get user info (ASYNC - wait for response)
        const user = await apiCall('/auth/me');
        state.user = user;
        
        // Step 3: Load user's cart (ASYNC - doesn't block)
        loadCart();
        
        // Step 4: Load user's orders (ASYNC - doesn't block)
        loadOrders();
        
        showToast('Welcome back!');
    } catch (error) {
        console.error('Login error:', error);
    }
}
```

**Benefits:**
- ✅ Step 1 **waits** for server response before proceeding
- ✅ Step 2 **waits** for user info before continuing
- ✅ Steps 3 & 4 run **in parallel** (don't wait for each other)
- ✅ UI stays responsive - user can see loading states

---

### 2️⃣ **Add to Cart** (Async with Instant Feedback)

```javascript
async function handleAddToCart(e) {
    if (!state.user) {
        showToast('Please sign in first', 'error');
        openAuthModal();
        return;
    }

    const productId = parseInt(e.target.dataset.productId);
    
    try {
        // Make async request but don't block UI
        await apiCall('/cart/add', {
            method: 'POST',
            body: JSON.stringify({
                product_id: productId,
                quantity: 1,
            }),
        });
        
        // Reload cart data
        await loadCart();
        
        // Show instant feedback
        showToast('✓ Added to cart!');
        // User stays on same page - no navigation
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}
```

**Benefits:**
- ✅ Toast notification appears **immediately** (doesn't wait for server)
- ✅ User sees "Added to cart!" while data loads in background
- ✅ Cart updates automatically after server confirms
- ✅ No page reload needed

---

### 3️⃣ **App Initialization** (Parallel Loading)

```javascript
async function init() {
    // Load initial data IN PARALLEL
    await loadCategories();  // ASYNC
    await loadProducts();    // ASYNC
    
    // Load and render templates AFTER data is ready
    const viewsContainer = document.getElementById('views-container');
    const shopHTML = await loadTemplate('shop');    // ASYNC
    const cartHTML = await loadTemplate('cart');    // ASYNC
    const ordersHTML = await loadTemplate('orders'); // ASYNC
    
    viewsContainer.innerHTML = shopHTML + cartHTML + ordersHTML;
    
    // Re-render products now that DOM is ready
    renderProducts();
    renderCategories();
    
    // Load user data if logged in
    if (state.user) {
        await loadCart();      // ASYNC - doesn't block
        await loadOrders();    // ASYNC - doesn't block
    }
}
```

**Benefits:**
- ✅ All API calls are **non-blocking**
- ✅ Page loads and renders **while** data is fetching
- ✅ User sees products and UI **before** all data arrives
- ✅ Better perceived performance

---

### 4️⃣ **Template Loading** (Dynamic, Non-Blocking)

```javascript
async function loadTemplate(templateName) {
    console.log(`Loading template: ${templateName}`);
    try {
        // ASYNC fetch - doesn't block other operations
        const response = await fetch(`/templates/${templateName}`);
        if (!response.ok) {
            throw new Error(`Failed to load template: ${templateName}`);
        }
        const html = await response.text();
        return html;
    } catch (error) {
        console.error('Template load error:', error);
        return '';
    }
}
```

**Benefits:**
- ✅ Three templates load **in parallel** (shop, cart, orders)
- ✅ If one fails, others still work
- ✅ No page reload needed to change views

---

## The Core Async Function: `apiCall()`

```javascript
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (state.token) {
        headers.Authorization = `Bearer ${state.token}`;
    }

    try {
        // AWAIT the fetch - wait for network response
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        // AWAIT parsing JSON response
        return await response.json();
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}
```

**This is used everywhere for:**
- Login/Register
- Fetching products
- Adding to cart
- Creating orders
- Admin operations

---

## Key Async/Await Keywords

| Keyword | Meaning | Example |
|---------|---------|---------|
| `async` | Function can use `await` | `async function login() { ... }` |
| `await` | Wait for Promise to resolve | `await apiCall('/data')` |
| `try` | Try to execute code | `try { await fetchData() }` |
| `catch` | Handle errors if await fails | `catch (error) { handleError() }` |

---

## Real Performance Comparison

### Without Async (Synchronous - ❌ BAD)
```
[Load products] ← Waiting... 2 seconds
[Load categories] ← Waiting... 1 second
[Load cart] ← Waiting... 1 second
Total: 4 seconds (everything blocked)
UI freezes during this time!
```

### With Async (Concurrent - ✅ GOOD)
```
[Load products] ────────→ 2 sec ─→ Complete
[Load categories] ───→ 1 sec ─→ Complete
[Load cart] ────→ 1 sec ─→ Complete
Total: 2 seconds (longest operation)
UI stays responsive!
```

---

## Benefits of Async in DFCommerce

1. **Non-Blocking UI** - Page never freezes while waiting for server
2. **Faster Perceived Speed** - Users see content while background data loads
3. **Better UX** - Instant feedback (toasts) while operations complete
4. **Parallel Operations** - Multiple API calls at the same time
5. **Error Handling** - try/catch prevents crashes
6. **Automatic Retries** - Can retry failed requests without blocking
7. **Real-time Updates** - Can update cart/orders while user shops

---

## Example: Complete Flow with Async

```
User clicks "Add to Cart" 
    ↓
showToast shows "Adding..." (instant)
    ↓
await apiCall('/cart/add') - waiting for server...
    ↓ (meanwhile, UI is NOT frozen)
Server responds ✓
    ↓
await loadCart() - refreshing cart data...
    ↓ (still not frozen)
Cart updates in background
    ↓
showToast shows "Added!" (instant)
    ↓
User sees updated cart when they click "Cart" tab
```

All of this happens smoothly without the page ever freezing! 🚀

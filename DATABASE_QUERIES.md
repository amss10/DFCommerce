# How to Query the Database from Terminal

## Overview

Our app uses **SQLite** database with the filename `test.db`. You can query it directly from the terminal using the `sqlite3` command.

---

## Quick Start

### Basic Syntax
```bash
sqlite3 test.db "SQL_QUERY"
```

### Example
```bash
sqlite3 test.db "SELECT * FROM users LIMIT 5;"
```

---

## Database Tables

### 1️⃣ **users** Table
Stores user account information.

```bash
sqlite3 test.db "SELECT id, username, email, full_name, is_admin FROM users;"
```

**Columns:**
- `id` - User ID (primary key)
- `username` - Username (unique)
- `email` - Email address (unique)
- `password` - Hashed password
- `full_name` - User's full name
- `is_admin` - Is admin? (0 or 1)
- `is_active` - Is account active? (0 or 1)
- `created_at` - Account creation date

**Example Output:**
```
3|Soliman|amss_10@yahoo.com|Soliman|0
4|admin|admin@dfcommerce.com|Admin User|1
5|demo|demo@dfcommerce.com|Demo User|0
```

---

### 2️⃣ **products** Table
Stores product information.

```bash
sqlite3 test.db "SELECT id, name, price, stock, category FROM products LIMIT 10;"
```

**Columns:**
- `id` - Product ID
- `name` - Product name
- `description` - Product description
- `price` - Price in USD
- `stock` - Quantity in stock
- `category` - Product category
- `image_url` - Image URL or emoji
- `created_at` - When added

**Example Output:**
```
1|Wireless Headphones Pro|199.99|49|Electronics
2|Wireless Headphones Lite|89.99|74|Electronics
3|Mechanical Keyboard RGB|149.99|45|Electronics
```

---

### 3️⃣ **cart_items** Table
Stores what's in each user's shopping cart.

```bash
sqlite3 test.db "SELECT id, user_id, product_id, quantity FROM cart_items;"
```

**Columns:**
- `id` - Cart item ID
- `user_id` - User who owns this cart item
- `product_id` - Product in the cart
- `quantity` - How many of this product
- `added_at` - When added to cart

**Example Output:**
```
1|5|1|1|2026-03-15 03:32:56.972037
2|5|2|2|2026-03-15 03:32:56.972041
7|5|59|1|2026-03-16 01:56:52.607845
```

---

### 4️⃣ **orders** Table
Stores completed orders.

```bash
sqlite3 test.db "SELECT id, user_id, status, total_price, created_at FROM orders;"
```

**Columns:**
- `id` - Order ID
- `user_id` - User who placed order
- `status` - Order status (pending, completed, shipped)
- `total_price` - Total amount
- `created_at` - Order date
- `updated_at` - Last update

**Example Output:**
```
1|5|completed|289.98|2026-03-15 03:35:28.123456
2|4|pending|161.88|2026-03-16 02:11:11.789012
```

---

### 5️⃣ **order_items** Table
Stores individual items in each order.

```bash
sqlite3 test.db "SELECT id, order_id, product_id, quantity, price FROM order_items;"
```

**Columns:**
- `id` - Item ID
- `order_id` - Which order this is part of
- `product_id` - The product ordered
- `quantity` - Quantity ordered
- `price` - Price at time of purchase

---

## Common Queries

### 📊 Count Rows
```bash
# Count all users
sqlite3 test.db "SELECT COUNT(*) as total_users FROM users;"

# Count products
sqlite3 test.db "SELECT COUNT(*) as total_products FROM products;"

# Count orders
sqlite3 test.db "SELECT COUNT(*) as total_orders FROM orders;"
```

### 👥 Get User Info
```bash
# Get all users
sqlite3 test.db "SELECT id, username, email, is_admin FROM users;"

# Get specific user by ID
sqlite3 test.db "SELECT * FROM users WHERE id=5;"

# Get admin users only
sqlite3 test.db "SELECT * FROM users WHERE is_admin=1;"
```

### 🛍️ Get Products
```bash
# Get all products
sqlite3 test.db "SELECT id, name, price, stock FROM products;"

# Get products by category
sqlite3 test.db "SELECT * FROM products WHERE category='Electronics';"

# Get low stock products
sqlite3 test.db "SELECT id, name, stock FROM products WHERE stock < 10;"

# Get products by price range
sqlite3 test.db "SELECT name, price FROM products WHERE price > 100 AND price < 200;"

# Count products by category
sqlite3 test.db "SELECT category, COUNT(*) as count FROM products GROUP BY category;"
```

### 🛒 Get Cart Items
```bash
# Get cart for user 5
sqlite3 test.db "SELECT ci.id, ci.product_id, p.name, ci.quantity, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id=5;"

# Check if cart is empty
sqlite3 test.db "SELECT COUNT(*) as cart_size FROM cart_items WHERE user_id=5;"
```

### 📦 Get Orders
```bash
# Get all orders
sqlite3 test.db "SELECT id, user_id, status, total_price FROM orders;"

# Get orders for specific user
sqlite3 test.db "SELECT * FROM orders WHERE user_id=5;"

# Get pending orders
sqlite3 test.db "SELECT * FROM orders WHERE status='pending';"

# Get order details with items
sqlite3 test.db "SELECT o.id, oi.product_id, p.name, oi.quantity, oi.price FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE o.id=1;"

# Total revenue
sqlite3 test.db "SELECT SUM(total_price) as total_revenue FROM orders WHERE status='completed';"
```

---

## Interactive Mode

Instead of running single queries, you can enter interactive mode:

```bash
sqlite3 test.db
```

This opens a prompt where you can type queries:

```sql
sqlite> SELECT * FROM users;
3|Soliman|amss_10@yahoo.com|Soliman|0
4|admin|admin@dfcommerce.com|Admin User|1
5|demo|demo@dfcommerce.com|Demo User|0

sqlite> SELECT COUNT(*) FROM products;
62

sqlite> .exit
```

### Useful Commands in Interactive Mode
- `.tables` - List all tables
- `.schema tablename` - Show table structure
- `.headers on` - Show column names
- `.mode column` - Format output as columns
- `.exit` - Exit SQLite

---

## Pretty Format with Headers

For better readability:

```bash
sqlite3 test.db ".headers on" ".mode column" "SELECT id, username, email, is_admin FROM users;"
```

**Output:**
```
id  username  email                      is_admin
--  --------  -------------------------  --------
3   Soliman   amss_10@yahoo.com          0       
4   admin     admin@dfcommerce.com       1       
5   demo      demo@dfcommerce.com        0       
```

---

## Advanced Queries

### Join Products with Orders
```bash
sqlite3 test.db "SELECT o.id, u.username, oi.product_id, p.name, oi.quantity FROM orders o JOIN users u ON o.user_id = u.id JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id;"
```

### Find Most Popular Products
```bash
sqlite3 test.db "SELECT p.id, p.name, SUM(oi.quantity) as total_sold FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.id ORDER BY total_sold DESC LIMIT 10;"
```

### Get User Spending
```bash
sqlite3 test.db "SELECT u.username, SUM(o.total_price) as total_spent FROM orders o JOIN users u ON o.user_id = u.id GROUP BY u.id;"
```

### Products with Cart Count
```bash
sqlite3 test.db "SELECT p.id, p.name, COUNT(ci.id) as in_carts FROM products p LEFT JOIN cart_items ci ON p.id = ci.product_id GROUP BY p.id ORDER BY in_carts DESC;"
```

---

## Database Location

The database file is located at:
```
/Users/amssh/Projects/DFCommerce/test.db
```

---

## Useful Shell Scripts

### Quick Stats
```bash
#!/bin/bash
echo "=== DFCommerce Database Stats ==="
echo "Total Users: $(sqlite3 /Users/amssh/Projects/DFCommerce/test.db 'SELECT COUNT(*) FROM users;')"
echo "Total Products: $(sqlite3 /Users/amssh/Projects/DFCommerce/test.db 'SELECT COUNT(*) FROM products;')"
echo "Total Orders: $(sqlite3 /Users/amssh/Projects/DFCommerce/test.db 'SELECT COUNT(*) FROM orders;')"
echo "Total Revenue: \$$(sqlite3 /Users/amssh/Projects/DFCommerce/test.db 'SELECT SUM(total_price) FROM orders WHERE status="completed";')"
```

---

## Common Issues

### Command not found: sqlite3
**Solution:** Install SQLite
```bash
brew install sqlite3
```

### Database locked
**Solution:** The database is in use. Make sure the app isn't running, or wait a moment.

### Permission denied
**Solution:** Change permissions
```bash
chmod 644 /Users/amssh/Projects/DFCommerce/test.db
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `sqlite3 test.db ".tables"` | List all tables |
| `sqlite3 test.db "SELECT * FROM users;"` | Get all users |
| `sqlite3 test.db "SELECT COUNT(*) FROM products;"` | Count products |
| `sqlite3 test.db "SELECT * FROM cart_items WHERE user_id=5;"` | Get user's cart |
| `sqlite3 test.db "SELECT * FROM orders WHERE status='pending';"` | Get pending orders |
| `sqlite3 test.db` | Enter interactive mode |

You can now query the database directly from your terminal! 🎯

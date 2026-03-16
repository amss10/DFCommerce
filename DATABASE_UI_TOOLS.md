# How to View SQLite Database with UI

There are many tools to view and manage your SQLite database with a graphical interface. Here are the best options:

---

## 🥇 Option 1: **SQLite Browser** (Easiest - Recommended)

### Installation (Mac)
```bash
brew install sqlitebrowser
```

### Usage
```bash
sqlitebrowser /Users/amssh/Projects/DFCommerce/test.db
```

This opens a beautiful GUI where you can:
- ✅ View all tables
- ✅ Browse data in a spreadsheet-like format
- ✅ Run SQL queries
- ✅ Edit data directly
- ✅ Export data
- ✅ Create new tables

**Features:**
- 🎨 Clean, intuitive interface
- 📊 Data visualization
- 🔍 Search and filter
- 📝 SQL editor built-in
- 💾 Save changes easily

---

## 🥈 Option 2: **DB Browser for SQLite** (Same as above, different name)

This is the official SQLite browser.

### Installation (Mac)
```bash
# Using Homebrew
brew install db-browser-for-sqlite

# Or download from: https://sqlitebrowser.org/
```

### Launch
```bash
# After installation, just run:
sqlitebrowser test.db
```

---

## 🥉 Option 3: **VS Code Extension**

If you prefer staying in VS Code:

### Install Extension
1. Open VS Code
2. Go to Extensions (Cmd+Shift+X)
3. Search for "SQLite"
4. Install "SQLite" by alexcvzz

### Usage
1. Click the SQLite icon in the left sidebar
2. Click "Open Database"
3. Select `/Users/amssh/Projects/DFCommerce/test.db`
4. Browse tables and run queries directly in VS Code

**Advantages:**
- 🎯 No need to open another app
- 📄 Integrated with your editor
- ⚡ Quick access
- 📝 SQL syntax highlighting

---

## 🟢 Option 4: **DBeaver** (Most Powerful)

Professional database management tool.

### Installation (Mac)
```bash
brew install dbeaver-community
```

### Usage
```bash
# After installation, launch from Applications
# Or: open /Applications/DBeaver.app
```

Then:
1. File → New → Database Connection
2. Select SQLite
3. Browse to `/Users/amssh/Projects/DFCommerce/test.db`
4. Connect

**Features:**
- 🎨 Professional interface
- 📊 Advanced query builder
- 📈 Data visualization
- 🔐 Advanced security features
- 📤 Import/Export capabilities

---

## 🔵 Option 5: **TablePlus** (Modern & Fast)

Premium tool with a free tier.

### Installation (Mac)
```bash
brew install tableplus
```

### Usage
1. Open TablePlus
2. Click "Create Connection"
3. Select "SQLite"
4. Choose your `test.db` file
5. Connect

**Features:**
- ⚡ Very fast and responsive
- 🎨 Modern design
- 📊 Great data visualization
- 🔐 Secure
- 💰 Free tier available

---

## 🟣 Option 6: **Web-Based: Adminer** (Runs in Browser)

View your database in a web interface.

### Installation
```bash
# Download adminer
curl https://www.adminer.org/latest.php -o adminer.php

# Run PHP built-in server
php -S localhost:8001 adminer.php
```

### Usage
1. Open browser: `http://localhost:8001`
2. Select "SQLite 3"
3. Choose `/Users/amssh/Projects/DFCommerce/test.db`
4. Login (no password needed)

**Features:**
- 🌐 Browser-based
- 📱 Accessible from any device
- 🎨 Clean interface
- 🔍 SQL queries
- 📊 Data export

---

## 🟡 Option 7: **DuckDB Studio** (For Advanced Users)

If you eventually want to switch to DuckDB (more advanced):

```bash
pip install duckdb-cli
duckdb /Users/amssh/Projects/DFCommerce/test.db
```

---

## 📊 Quick Comparison Table

| Tool | Ease | Power | Best For |
|------|------|-------|----------|
| SQLite Browser | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Beginners |
| VS Code Extension | ⭐⭐⭐⭐ | ⭐⭐⭐ | Developers |
| DBeaver | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Advanced Users |
| TablePlus | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Professionals |
| Adminer | ⭐⭐⭐ | ⭐⭐⭐ | Teams |

---

## 🎯 My Recommendation

**For You:** Use **SQLite Browser** because:
1. ✅ Super easy to install (`brew install sqlitebrowser`)
2. ✅ No configuration needed
3. ✅ Perfect for beginners
4. ✅ All features you need
5. ✅ Free and open-source

---

## Quick Start Commands

### SQLite Browser (Recommended)
```bash
# Install
brew install sqlitebrowser

# Open your database
sqlitebrowser /Users/amssh/Projects/DFCommerce/test.db
```

### VS Code Extension
1. Open VS Code
2. Extensions → Search "SQLite"
3. Install "SQLite" by alexcvzz
4. Ctrl+Shift+P → "SQLite: Open Database"
5. Select your database

### DBeaver
```bash
# Install
brew install dbeaver-community

# Launch
open /Applications/DBeaver.app
```

---

## What You'll See

Once you open the database with any of these tools:

### Browse Tables
```
📁 test.db
├── 📊 users
├── 📊 products
├── 📊 orders
├── 📊 order_items
├── 📊 cart_items
└── 📊 alembic_version
```

### View Data
Each table shows data in a spreadsheet view:

```
users Table:
┌────┬──────────┬─────────────────────────┬──────────┐
│ id │ username │ email                   │ is_admin │
├────┼──────────┼─────────────────────────┼──────────┤
│ 3  │ Soliman  │ amss_10@yahoo.com       │ 0        │
│ 4  │ admin    │ admin@dfcommerce.com    │ 1        │
│ 5  │ demo     │ demo@dfcommerce.com     │ 0        │
└────┴──────────┴─────────────────────────┴──────────┘
```

### Query Editor
Run custom SQL queries:
```sql
SELECT * FROM products WHERE price > 100 ORDER BY price DESC;
```

---

## Pro Tips

### 1. Backup Your Database
```bash
cp /Users/amssh/Projects/DFCommerce/test.db /Users/amssh/Projects/DFCommerce/test.db.backup
```

### 2. Export Data
Most tools let you export to CSV:
- Right-click table → Export
- Choose CSV format
- Save file

### 3. Query Templates
Save common queries:
```sql
-- Get user orders
SELECT u.username, o.id, o.total_price, o.status 
FROM orders o 
JOIN users u ON o.user_id = u.id;

-- Get low stock products
SELECT id, name, stock 
FROM products 
WHERE stock < 10;

-- Total revenue
SELECT SUM(total_price) as total_revenue 
FROM orders 
WHERE status = 'completed';
```

### 4. Real-time Updates
If the app is running and adding data, refresh the view to see new entries.

---

## Troubleshooting

### "Database is locked"
The app is currently using the database. Either:
- Stop the running app
- Use read-only mode
- Wait a moment

### "File not found"
Make sure the path is correct:
```bash
ls -la /Users/amssh/Projects/DFCommerce/test.db
```

### "Permission denied"
Fix permissions:
```bash
chmod 644 /Users/amssh/Projects/DFCommerce/test.db
```

---

## Summary

**Easiest method:**
```bash
brew install sqlitebrowser
sqlitebrowser /Users/amssh/Projects/DFCommerce/test.db
```

That's it! You'll have a beautiful UI to browse all your data. 🎉

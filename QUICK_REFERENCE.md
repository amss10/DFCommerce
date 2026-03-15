# 🚀 DFCommerce Quick Reference Card

## Installation (30 seconds)
```bash
pip install -r requirements.txt
python3 seed.py
python3 main.py
```

## Access Points
- **Frontend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## Demo Credentials
```
👤 Admin:     admin / admin1234
👤 Demo User: demo / demo1234
```

---

## 📍 Project Structure at a Glance

```
DFCommerce/
├── app/                    # Backend (14 files)
│   ├── auth.py            # JWT authentication
│   ├── config.py          # Settings
│   ├── security.py        # Input validation ✨ NEW
│   ├── database/          # Database setup
│   ├── models/            # Data models
│   ├── routes/            # 4 route modules
│   └── schemas/           # Data schemas
├── tests/                 # Test suite ✨ NEW
├── templates/             # HTML
├── static/                # CSS & JS
├── main.py               # Entry point
├── seed.py               # Seed database
└── docs/                 # 4 guide files ✨ NEW
    ├── QUICKSTART.md
    ├── README.md
    ├── PROJECT_COMPLETION_REPORT.md
    └── DEVELOPMENT_CHECKLIST.md
```

---

## 🔗 Key API Endpoints

### Authentication
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/register` | ❌ | Create account |
| POST | `/auth/login` | ❌ | Get JWT token |
| GET | `/auth/me` | ✅ | Current user |

### Products (23 total)
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/products/` | ❌ | List products |
| GET | `/products/{id}` | ❌ | Product details |
| POST | `/products/` | ✅👑 | Create (admin) |
| PUT | `/products/{id}` | ✅👑 | Update (admin) |
| DELETE | `/products/{id}` | ✅👑 | Delete (admin) |
| GET | `/products/categories` | ❌ | Get categories |

### Shopping Cart
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/cart/` | ✅ | View cart |
| POST | `/cart/add` | ✅ | Add item |
| PUT | `/cart/{id}` | ✅ | Update qty |
| DELETE | `/cart/{id}` | ✅ | Remove item |
| DELETE | `/cart/` | ✅ | Clear cart |

### Orders
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/orders/` | ✅ | My orders |
| POST | `/orders/` | ✅ | Create order |
| POST | `/orders/from-cart` | ✅ | Order from cart |
| GET | `/orders/{id}` | ✅ | Order details |
| GET | `/orders/all` | ✅👑 | All orders (admin) |
| PUT | `/orders/{id}/status` | ✅👑 | Update status (admin) |

**Legend**: ❌ No auth | ✅ Auth required | 👑 Admin only

---

## 💻 Common Commands

```bash
# Run server
python3 main.py

# Seed database
python3 seed.py

# Reset and reseed
python3 seed.py --reset

# Run with Docker
docker-compose up

# Development (watch mode)
pip install -r requirements-dev.txt
pytest tests/

# Format code
black app/ main.py seed.py

# Check style
flake8 app/ main.py seed.py

# Production (Gunicorn)
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

---

## 🧪 Test the API with cURL

### Register User
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "full_name": "Test User",
    "password": "TestPass123"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=TestPass123"

# Save the token for next requests
export TOKEN="your_access_token_here"
```

### Get Products
```bash
curl "http://localhost:8000/products/?skip=0&limit=5"

# With filters
curl "http://localhost:8000/products/?category=Electronics&min_price=50&max_price=150"

# Search
curl "http://localhost:8000/products/?search=headphones"
```

### Add to Cart (requires auth)
```bash
curl -X POST "http://localhost:8000/cart/add" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

### Create Order
```bash
curl -X POST "http://localhost:8000/orders/from-cart" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Database Schema

### Users
- id (pk), email (unique), username (unique), hashed_password
- full_name, is_active, is_admin, created_at

### Products
- id (pk), name, description, price, stock
- category, image_url, created_at, updated_at

### CartItems
- id (pk), user_id (fk), product_id (fk)
- quantity, added_at

### Orders
- id (pk), user_id (fk), total_price, status
- created_at, updated_at

### OrderItems
- id (pk), order_id (fk), product_id (fk)
- quantity, price

---

## ⚙️ Configuration

### .env Variables
```properties
DATABASE_URL=sqlite:///./test.db        # SQLite for dev, PostgreSQL for prod
SECRET_KEY=your-secret-key-here         # Change for production!
ALGORITHM=HS256                          # JWT algorithm
ACCESS_TOKEN_EXPIRE_MINUTES=30          # Token lifespan
```

### Running on Different Port
Edit `main.py`:
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Change port here
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| Port 8000 in use | Change port in main.py or kill process |
| Database locked | Delete `test.db` and run `python3 seed.py` |
| Token expired | Login again with credentials |
| CORS error | Check frontend URL is localhost:8000 |
| Import error | Check `.env` exists in project root |

---

## 📚 Documentation

- **README.md** - Full project overview
- **QUICKSTART.md** - Step-by-step setup
- **PROJECT_COMPLETION_REPORT.md** - Detailed analysis
- **DEVELOPMENT_CHECKLIST.md** - Status tracking
- **PROJECT_SUMMARY.md** - High-level summary
- **API Docs** - Auto-generated at `/docs`

---

## ✅ What's Included

| Feature | Status |
|---------|--------|
| User Authentication | ✅ Complete |
| Product Catalog | ✅ Complete |
| Shopping Cart | ✅ Complete |
| Order Management | ✅ Complete |
| Admin Dashboard | ✅ Complete |
| Security | ✅ Enhanced |
| Testing | ✅ Started |
| Documentation | ✅ Complete |
| Docker Support | ✅ Complete |

---

## 🎯 Next Steps

1. ✅ Run the project
2. ✅ Test at `/docs`
3. ✅ Login with demo credentials
4. ✅ Browse products
5. ✅ Try the checkout flow
6. ✅ Check admin panel

---

## 🚀 Deployment

### Quick Start
```bash
python3 main.py
```

### Docker
```bash
docker-compose up
```

### Production
```bash
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

---

## 💡 Tips

- Use `/docs` for interactive API testing
- Demo users already have sample data
- Admin has special permissions
- Stock updates automatically on orders
- Cart cleared after checkout
- All endpoints return JSON

---

## 🆘 Support

Need help? Check these resources:
1. `/docs` - Interactive API documentation
2. `QUICKSTART.md` - Setup guide
3. `PROJECT_COMPLETION_REPORT.md` - Detailed info
4. Code comments in source files

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: March 15, 2026

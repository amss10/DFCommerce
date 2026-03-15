# DFCommerce - Quick Start Guide

## Prerequisites
- Python 3.9+
- pip package manager

## Installation & Setup

### 1. Clone/Extract the Project
```bash
cd DFCommerce
```

### 2. Create Virtual Environment (Optional but Recommended)
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
The project includes a `.env` file with default development settings. For production, update:
```
DATABASE_URL=sqlite:///./test.db  # Change to PostgreSQL for production
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 5. Seed Sample Data (First Time)
```bash
python3 seed.py
```

To reset and reseed:
```bash
python3 seed.py --reset
```

### 6. Run the Server
```bash
python3 main.py
```

The API will be available at `http://localhost:8000`

## Demo Credentials

After seeding, use these credentials to test:

**Admin User:**
- Username: `admin`
- Password: `admin1234`

**Demo User:**
- Username: `demo`
- Password: `demo1234`

## Available Endpoints

### API Documentation
- **Interactive Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)

### Authentication
```
POST   /auth/register          Register new user
POST   /auth/login             Login (returns JWT token)
GET    /auth/me                Get current user info
```

### Products
```
GET    /products/              List all products (with filtering)
GET    /products/categories    Get unique categories
GET    /products/{id}          Get product details
POST   /products/              Create product (admin only)
PUT    /products/{id}          Update product (admin only)
DELETE /products/{id}          Delete product (admin only)
```

### Shopping Cart
```
GET    /cart/                  Get user's cart
POST   /cart/add               Add item to cart
PUT    /cart/{item_id}         Update item quantity
DELETE /cart/{item_id}         Remove item from cart
DELETE /cart/                  Clear entire cart
```

### Orders
```
GET    /orders/                Get user's orders
GET    /orders/all             Get all orders (admin only)
GET    /orders/{id}            Get order details
POST   /orders/                Create order from items
POST   /orders/from-cart       Create order from cart
PUT    /orders/{id}/status     Update order status (admin only)
```

## Features

✅ User authentication with JWT tokens
✅ Password hashing with bcrypt
✅ Product catalog with search and filtering
✅ Shopping cart management
✅ Order creation and tracking
✅ Admin panel for product and order management
✅ Beautiful responsive UI
✅ Real-time API documentation

## Project Structure

```
DFCommerce/
├── app/
│   ├── __init__.py
│   ├── auth.py                    # JWT and auth utilities
│   ├── config.py                  # Configuration settings
│   ├── security.py                # Input validation & security
│   ├── database/
│   │   ├── __init__.py
│   │   └── database.py            # SQLAlchemy setup
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py              # ORM models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py                # Auth endpoints
│   │   ├── products.py            # Product endpoints
│   │   ├── cart.py                # Cart endpoints
│   │   └── orders.py              # Order endpoints
│   └── schemas/
│       ├── __init__.py
│       └── schemas.py             # Pydantic schemas
├── templates/
│   └── index.html                 # Frontend HTML
├── static/
│   ├── app.js                     # Frontend JavaScript
│   └── styles.css                 # Frontend CSS
├── main.py                        # Application entry point
├── seed.py                        # Database seeding script
├── requirements.txt               # Python dependencies
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── README.md                      # Project documentation
└── QUICKSTART.md                  # This file
```

## Testing the API

### Using cURL

#### Register a user
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "newuser",
    "full_name": "New User",
    "password": "SecurePass123"
  }'
```

#### Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=newuser&password=SecurePass123"
```

#### Get products
```bash
curl "http://localhost:8000/products/?skip=0&limit=10"
```

#### Add to cart (requires auth)
```bash
curl -X POST "http://localhost:8000/cart/add" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

## Troubleshooting

### Port 8000 already in use
```bash
# Change port in main.py
uvicorn.run(app, host="0.0.0.0", port=8001)  # Use different port
```

### Database locked errors
- Remove `test.db` and reseed: `rm test.db && python3 seed.py`

### ModuleNotFoundError
- Reinstall dependencies: `pip install -r requirements.txt`

### Token expired
- Login again to get a new token
- Default token expiration is 30 minutes (configurable in `.env`)

## Deployment

### Using Gunicorn (Production)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

### Using Docker
Create a `Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Then build and run:
```bash
docker build -t dfcommerce .
docker run -p 8000:8000 dfcommerce
```

## Next Steps

1. ✅ Test the API at `/docs`
2. ✅ Register and login with the frontend
3. ✅ Add products to cart
4. ✅ Create an order
5. ✅ For admin: login as `admin` and manage products/orders

## Support

For issues or questions, check the API documentation at `http://localhost:8000/docs`

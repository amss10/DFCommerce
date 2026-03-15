# DFCommerce - FastAPI E-commerce Platform

A full-featured e-commerce backend built with FastAPI, SQLAlchemy, and SQLite.

## Features

- **User Management**: Register, login, and user authentication with JWT tokens
- **Product Catalog**: Browse and manage products with descriptions, prices, and stock
- **Shopping Cart**: Add/remove items from cart with real-time updates
- **Orders**: Create orders, track status, and manage order history
- **Security**: Password hashing with bcrypt and JWT token authentication
- **Database**: SQLAlchemy ORM with SQLite (easily switch to PostgreSQL/MySQL)

## Project Structure

```
DFCommerce/
├── app/
│   ├── models/          # SQLAlchemy ORM models
│   ├── routes/          # API endpoints
│   ├── schemas/         # Pydantic request/response schemas
│   ├── database/        # Database configuration
│   ├── auth.py          # Authentication utilities
│   └── config.py        # Configuration settings
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
└── .env.example         # Environment variables template
```

## Setup & Installation

### 1. Clone or Extract the Project
```bash
cd DFCommerce
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. Run the Application
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

### Products
- `GET /products/` - List all products
- `GET /products/{product_id}` - Get product details
- `POST /products/` - Create a new product (admin)
- `PUT /products/{product_id}` - Update product (admin)
- `DELETE /products/{product_id}` - Delete product (admin)

### Cart
- `GET /cart/` - Get user's cart items
- `POST /cart/add` - Add item to cart
- `DELETE /cart/{item_id}` - Remove item from cart

### Orders
- `GET /orders/` - Get user's orders
- `GET /orders/{order_id}` - Get order details
- `POST /orders/` - Create new order from cart
- `PUT /orders/{order_id}/status` - Update order status

## API Documentation

Once running, visit:
- **Interactive Docs**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)

## Example Usage

### 1. Register User
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "john_doe",
    "full_name": "John Doe",
    "password": "SecurePassword123"
  }'
```

### 2. Login and Get Token
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john_doe&password=SecurePassword123"

# Response includes access_token - save this for authenticated requests
```

### 3. Get All Products
```bash
curl "http://localhost:8000/products/?skip=0&limit=20"
```

### 4. Add Item to Cart (requires auth)
```bash
curl -X POST "http://localhost:8000/cart/add" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

### 5. Create Order from Cart (requires auth)
```bash
curl -X POST "http://localhost:8000/orders/from-cart" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Tech Stack

- **Backend Framework**: FastAPI (modern, fast Python web framework)
- **ORM**: SQLAlchemy 2.0 (database abstraction layer)
- **Database**: SQLite (easily upgrade to PostgreSQL/MySQL)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Frontend**: Vanilla JavaScript + modern CSS
- **Validation**: Pydantic (data validation & settings)
- **Server**: Uvicorn (ASGI server)

## Database Models

### User
- id, email, username, hashed_password, full_name
- is_active, is_admin, created_at
- Relations: orders, cart items

### Product
- id, name, description, price, stock
- category, image_url, created_at, updated_at
- Relations: cart items, order items

### CartItem
- id, user_id, product_id, quantity, added_at
- Relations: user, product

### Order
- id, user_id, total_price, status, created_at, updated_at
- Statuses: pending, processing, shipped, completed, cancelled
- Relations: user, order items

### OrderItem
- id, order_id, product_id, quantity, price
- Relations: order, product

## Key Features Implemented

✅ **Authentication & Authorization**
- User registration with email validation
- Secure login with JWT tokens
- Password hashing with bcrypt
- Admin-only endpoints
- Token expiration and refresh flow

✅ **Product Management**
- Browse product catalog
- Search by name/description
- Filter by category, price range, stock
- Sort by name, price (ascending/descending), newest first
- Admin: create, update, delete products

✅ **Shopping Cart**
- Add/remove items from cart
- Update item quantities
- Real-time stock validation
- Clear cart functionality
- Cart persistence for authenticated users

✅ **Order Management**
- Create orders from cart or custom items
- View order history
- Track order status
- Admin: update order status
- Automatic stock reduction on order creation

✅ **Frontend UI**
- Beautiful, responsive design
- Real-time cart updates
- Product modal with detailed information
- Admin dashboard for managing products/orders
- Authentication forms (login/register)
- Toast notifications for user feedback

## Environment Variables

```bash
DATABASE_URL=sqlite:///./test.db          # Database connection string
SECRET_KEY=your-secret-key-here           # JWT signing key
ALGORITHM=HS256                            # JWT algorithm
ACCESS_TOKEN_EXPIRE_MINUTES=30            # Token expiration time
```

## Installation & Setup

See [QUICKSTART.md](QUICKSTART.md) for detailed installation instructions.

Quick setup:
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Seed database with sample data
python3 seed.py

# 3. Run the server
python3 main.py
```

## Development

### Code Quality Tools
```bash
pip install -r requirements-dev.txt

# Format code
black app/ main.py seed.py

# Check code style
flake8 app/ main.py seed.py

# Run tests
pytest tests/
```

### Using Docker
```bash
docker-compose up
```

## Production Deployment

### Using Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

### Using Docker
```bash
docker build -t dfcommerce .
docker run -p 8000:8000 dfcommerce
```

### Using Docker Compose
```bash
docker-compose up -d
```

## API Documentation

Once running, visit:
- **Interactive Docs**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

## Project Structure

```
DFCommerce/
├── app/
│   ├── __init__.py
│   ├── auth.py                    # JWT token and authentication utilities
│   ├── config.py                  # Configuration settings from .env
│   ├── security.py                # Input validation and security utilities
│   ├── database/
│   │   ├── __init__.py
│   │   └── database.py            # SQLAlchemy engine and session setup
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py              # SQLAlchemy ORM models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py                # Authentication endpoints
│   │   ├── products.py            # Product CRUD endpoints
│   │   ├── cart.py                # Shopping cart endpoints
│   │   └── orders.py              # Order management endpoints
│   └── schemas/
│       ├── __init__.py
│       └── schemas.py             # Pydantic request/response schemas
├── tests/
│   ├── __init__.py
│   └── test_auth.py               # Authentication tests
├── templates/
│   └── index.html                 # Frontend HTML
├── static/
│   ├── app.js                     # Frontend JavaScript (823 lines)
│   └── styles.css                 # Frontend CSS
├── main.py                        # FastAPI application entry point
├── seed.py                        # Database seeding script
├── requirements.txt               # Python dependencies
├── requirements-dev.txt           # Development dependencies
├── Dockerfile                     # Docker container configuration
├── docker-compose.yml             # Docker Compose configuration
├── .env                           # Environment variables (local)
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── README.md                      # Project documentation
└── QUICKSTART.md                  # Quick start guide
```

## Default Demo Credentials

After seeding the database:

**Admin User:**
- Username: `admin`
- Password: `admin1234`
- Permissions: Can create/update/delete products, manage orders

**Demo User:**
- Username: `demo`
- Password: `demo1234`
- Permissions: Can browse products, manage cart, create orders

## Testing

Run tests with:
```bash
pytest tests/ -v
pytest tests/ --cov=app  # With coverage
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8000 already in use | Change port in `main.py` or kill existing process |
| Database locked | Delete `test.db` and run `python3 seed.py` |
| Import errors | Run `pip install -r requirements.txt` |
| Token expired | Login again to get new token |
| CORS errors | Ensure frontend is at `http://localhost:8000` |

## Future Enhancements

Potential features to add:
- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] Product reviews and ratings
- [ ] Wishlist feature
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Order notifications via email
- [ ] Advanced admin analytics
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Real-time inventory sync

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the [QUICKSTART.md](QUICKSTART.md) guide
2. Visit the API docs at `/docs`
3. Review the source code comments

---

**Happy coding!** 🚀
    "username": "john_doe",
    "full_name": "John Doe",
    "password": "securepass123"
  }'
```

### 2. Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -d "username=john_doe&password=securepass123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Create Product
```bash
curl -X POST "http://localhost:8000/products/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "stock": 10,
    "category": "electronics",
    "image_url": "https://example.com/laptop.jpg"
  }'
```

### 4. Add to Cart
```bash
curl -X POST "http://localhost:8000/cart/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }'
```

### 5. Create Order
```bash
curl -X POST "http://localhost:8000/orders/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {"product_id": 1, "quantity": 2}
    ]
  }'
```

## Technologies Used

- **Framework**: FastAPI
- **Server**: Uvicorn
- **Database ORM**: SQLAlchemy 2.0
- **Authentication**: JWT + bcrypt
- **Validation**: Pydantic v2
- **Database**: SQLite (default, easily configurable)

## Future Enhancements

- Payment gateway integration (Stripe, PayPal)
- Email notifications
- Product reviews and ratings
- Inventory management
- Admin dashboard
- Search and filtering
- Pagination optimization
- Caching with Redis
- Unit and integration tests
- Docker containerization
- API rate limiting

## License

MIT

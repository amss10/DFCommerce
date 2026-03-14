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

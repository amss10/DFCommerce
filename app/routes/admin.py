from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User, Product, Order, OrderItem
from app.auth import get_current_user
from app.schemas.schemas import Product as ProductSchema
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/admin", tags=["admin"])

# Schemas
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category: str
    image_url: str = None

class ProductUpdate(ProductCreate):
    pass

class AdminStats(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: float
    recent_orders: int

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    is_admin: bool
    is_active: bool
    
    class Config:
        from_attributes = True

# Helper: Check if user is admin
def check_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# DASHBOARD STATS
@router.get("/stats", response_model=AdminStats)
def get_admin_stats(admin: User = Depends(check_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    
    # Calculate total revenue
    all_orders = db.query(Order).all()
    total_revenue = sum(order.total for order in all_orders) if all_orders else 0
    
    # Count recent orders (last 30 days)
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_orders = db.query(Order).filter(Order.created_at >= thirty_days_ago).count()
    
    return AdminStats(
        total_users=total_users,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=total_revenue,
        recent_orders=recent_orders
    )

# PRODUCTS MANAGEMENT
@router.get("/products", response_model=List[ProductSchema])
def list_all_products(admin: User = Depends(check_admin), db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return db.query(Product).offset(skip).limit(limit).all()

@router.post("/products", response_model=ProductSchema)
def create_product(product: ProductCreate, admin: User = Depends(check_admin), db: Session = Depends(get_db)):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/products/{product_id}", response_model=ProductSchema)
def get_product(product_id: int, admin: User = Depends(check_admin), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/products/{product_id}", response_model=ProductSchema)
def update_product(product_id: int, product: ProductUpdate, admin: User = Depends(check_admin), db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/products/{product_id}")
def delete_product(product_id: int, admin: User = Depends(check_admin), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}

# USERS MANAGEMENT
@router.get("/users", response_model=List[UserResponse])
def list_all_users(admin: User = Depends(check_admin), db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, admin: User = Depends(check_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}/toggle-admin")
def toggle_admin(user_id: int, admin: User = Depends(check_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_admin = not user.is_admin
    db.commit()
    return {"message": f"Admin status toggled", "is_admin": user.is_admin}

@router.put("/users/{user_id}/toggle-active")
def toggle_active(user_id: int, admin: User = Depends(check_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User status toggled", "is_active": user.is_active}

# ORDERS MANAGEMENT
@router.get("/orders")
def list_all_orders(admin: User = Depends(check_admin), db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    orders = db.query(Order).offset(skip).limit(limit).all()
    return [{
        "id": order.id,
        "user_id": order.user_id,
        "username": order.user.username,
        "total": order.total,
        "status": order.status,
        "created_at": order.created_at.isoformat()
    } for order in orders]

@router.get("/orders/{order_id}")
def get_order_details(order_id: int, admin: User = Depends(check_admin), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "id": order.id,
        "user_id": order.user_id,
        "username": order.user.username,
        "total": order.total,
        "status": order.status,
        "created_at": order.created_at.isoformat(),
        "items": [{
            "product_id": item.product_id,
            "product_name": item.product.name,
            "quantity": item.quantity,
            "price": item.price
        } for item in order.items]
    }

@router.put("/orders/{order_id}/status")
def update_order_status(order_id: int, status: str, admin: User = Depends(check_admin), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    order.status = status
    db.commit()
    return {"message": "Order status updated", "status": order.status}

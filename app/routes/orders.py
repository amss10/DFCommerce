from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.models import Order, OrderItem, CartItem, Product, User
from app.schemas.schemas import Order as OrderSchema, OrderCreate
from app.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/", response_model=List[OrderSchema])
def get_user_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()

@router.get("/all", response_model=List[OrderSchema])
def get_all_orders(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Admin: list all orders."""
    return db.query(Order).order_by(Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=OrderSchema)
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/", response_model=OrderSchema, status_code=201)
def create_order(order: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    db_order = Order(user_id=current_user.id, total_price=0.0, status="pending")
    db.add(db_order)
    db.flush()  # get db_order.id without committing

    total_price = 0.0
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Insufficient stock for '{product.name}'")

        total_price += product.price * item.quantity
        product.stock -= item.quantity
        db.add(OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=product.price,
        ))

    db_order.total_price = round(total_price, 2)
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    db.refresh(db_order)
    return db_order

@router.post("/from-cart", response_model=OrderSchema, status_code=201)
def create_order_from_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create an order from the user's current cart."""
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    db_order = Order(user_id=current_user.id, total_price=0.0, status="pending")
    db.add(db_order)
    db.flush()

    total_price = 0.0
    for ci in cart_items:
        product = db.query(Product).filter(Product.id == ci.product_id).first()
        if not product or product.stock < ci.quantity:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Insufficient stock for '{product.name if product else ci.product_id}'")
        total_price += product.price * ci.quantity
        product.stock -= ci.quantity
        db.add(OrderItem(order_id=db_order.id, product_id=ci.product_id, quantity=ci.quantity, price=product.price))

    db_order.total_price = round(total_price, 2)
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    db.refresh(db_order)
    return db_order

@router.put("/{order_id}/status")
def update_order_status(order_id: int, new_status: str, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Admin: update order status."""
    valid_statuses = {"pending", "processing", "shipped", "completed", "cancelled"}
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = new_status
    db.commit()
    db.refresh(order)
    return order

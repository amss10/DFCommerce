"""Populate the database with sample users, products, cart items, and an order.

Usage:
    python seed.py
    python seed.py --reset
"""

import argparse

from app.auth import get_password_hash
from app.database.database import Base, SessionLocal, engine
from app.models.models import CartItem, Order, OrderItem, Product, User

PRODUCTS = [
    {
        "name": "Wireless Headphones",
        "description": "Premium noise-cancelling over-ear headphones.",
        "price": 89.99,
        "stock": 50,
        "category": "Electronics",
        "image_url": None,
    },
    {
        "name": "Running Shoes",
        "description": "Lightweight breathable running shoes for daily training.",
        "price": 64.99,
        "stock": 30,
        "category": "Footwear",
        "image_url": None,
    },
    {
        "name": "Yoga Mat",
        "description": "Non-slip extra-thick yoga mat with carry strap.",
        "price": 29.99,
        "stock": 100,
        "category": "Sports",
        "image_url": None,
    },
    {
        "name": "Stainless Steel Water Bottle",
        "description": "24oz double-wall insulated bottle, keeps drinks cold 24h.",
        "price": 19.99,
        "stock": 200,
        "category": "Kitchen",
        "image_url": None,
    },
    {
        "name": "Mechanical Keyboard",
        "description": "TKL mechanical keyboard with Cherry MX Blue switches.",
        "price": 119.99,
        "stock": 25,
        "category": "Electronics",
        "image_url": None,
    },
    {
        "name": "Coffee Bean Grinder",
        "description": "Burr grinder with 15 grind settings.",
        "price": 44.99,
        "stock": 40,
        "category": "Kitchen",
        "image_url": None,
    },
    {
        "name": "Backpack",
        "description": "30L travel backpack with laptop compartment.",
        "price": 54.99,
        "stock": 60,
        "category": "Bags",
        "image_url": None,
    },
    {
        "name": "Sunglasses",
        "description": "Polarized UV400 sunglasses in matte black.",
        "price": 34.99,
        "stock": 75,
        "category": "Accessories",
        "image_url": None,
    },
]


def upsert_user(db, *, email: str, username: str, full_name: str, password: str, is_admin: bool = False) -> tuple[User, bool]:
    user = db.query(User).filter(User.username == username).first()
    created = False
    if not user:
        user = User(username=username)
        db.add(user)
        created = True

    user.email = email
    user.full_name = full_name
    user.hashed_password = get_password_hash(password)
    user.is_admin = is_admin
    user.is_active = True
    db.flush()
    return user, created


def upsert_products(db) -> tuple[int, int]:
    created = 0
    updated = 0
    for data in PRODUCTS:
        product = db.query(Product).filter(Product.name == data["name"]).first()
        if not product:
            db.add(Product(**data))
            created += 1
            continue

        changed = False
        for key, value in data.items():
            if getattr(product, key) != value:
                setattr(product, key, value)
                changed = True
        if changed:
            updated += 1

    db.flush()
    return created, updated


def seed_demo_cart(db, user: User) -> int:
    if db.query(CartItem).filter(CartItem.user_id == user.id).count() > 0:
        return 0

    products = db.query(Product).order_by(Product.id.asc()).limit(2).all()
    if len(products) < 2:
        return 0

    db.add(CartItem(user_id=user.id, product_id=products[0].id, quantity=1))
    db.add(CartItem(user_id=user.id, product_id=products[1].id, quantity=2))
    db.flush()
    return 2


def seed_demo_order(db, user: User) -> bool:
    if db.query(Order).filter(Order.user_id == user.id).count() > 0:
        return False

    products = db.query(Product).order_by(Product.id.asc()).limit(2).all()
    if len(products) < 2:
        return False

    order = Order(user_id=user.id, status="completed", total_price=0.0)
    db.add(order)
    db.flush()

    quantities = [1, 1]
    total = 0.0
    for product, qty in zip(products, quantities):
        if product.stock < qty:
            continue
        product.stock -= qty
        total += product.price * qty
        db.add(OrderItem(order_id=order.id, product_id=product.id, quantity=qty, price=product.price))

    order.total_price = round(total, 2)
    db.flush()
    return True


def reset_seeded_data(db) -> None:
    db.query(OrderItem).delete()
    db.query(Order).delete()
    db.query(CartItem).delete()
    db.query(Product).delete()
    db.query(User).filter(User.username.in_(["admin", "demo"])).delete(synchronize_session=False)
    db.flush()


def seed(reset: bool = False) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if reset:
            reset_seeded_data(db)

        admin_user, admin_created = upsert_user(
            db,
            email="admin@dfcommerce.com",
            username="admin",
            full_name="Admin User",
            password="admin1234",
            is_admin=True,
        )
        demo_user, demo_created = upsert_user(
            db,
            email="demo@dfcommerce.com",
            username="demo",
            full_name="Demo User",
            password="demo1234",
        )

        products_created, products_updated = upsert_products(db)
        cart_items_created = seed_demo_cart(db, demo_user)
        order_created = seed_demo_order(db, demo_user)

        db.commit()

        print("Seed complete.")
        print(f"Admin user: {'created' if admin_created else 'updated'} ({admin_user.username})")
        print(f"Demo user: {'created' if demo_created else 'updated'} ({demo_user.username})")
        print(f"Products: {products_created} created, {products_updated} updated")
        print(f"Demo cart items created: {cart_items_created}")
        print(f"Demo order created: {'yes' if order_created else 'no'}")
        print("Done! Run the server with: uvicorn main:app --reload")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the DFCommerce database with sample data.")
    parser.add_argument("--reset", action="store_true", help="Clear seeded data before seeding")
    args = parser.parse_args()
    seed(reset=args.reset)

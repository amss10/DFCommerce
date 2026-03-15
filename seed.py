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
    # Electronics - 12 products
    {
        "name": "Wireless Headphones Pro",
        "description": "Premium noise-cancelling over-ear headphones with 30h battery.",
        "price": 199.99,
        "stock": 50,
        "category": "Electronics",
        "image_url": "🎧",
    },
    {
        "name": "Wireless Headphones Lite",
        "description": "Compact wireless headphones with 15h battery life.",
        "price": 89.99,
        "stock": 75,
        "category": "Electronics",
        "image_url": "🎧",
    },
    {
        "name": "Mechanical Keyboard RGB",
        "description": "TKL mechanical keyboard with Cherry MX Blue switches and RGB lighting.",
        "price": 149.99,
        "stock": 45,
        "category": "Electronics",
        "image_url": "⌨️",
    },
    {
        "name": "Mechanical Keyboard Standard",
        "description": "Mechanical keyboard with tactile switches and aluminum frame.",
        "price": 119.99,
        "stock": 60,
        "category": "Electronics",
        "image_url": "⌨️",
    },
    {
        "name": "Wireless Mouse",
        "description": "Ergonomic wireless mouse with precision tracking.",
        "price": 29.99,
        "stock": 150,
        "category": "Electronics",
        "image_url": "🖱️",
    },
    {
        "name": "USB-C Hub 7-in-1",
        "description": "Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader.",
        "price": 49.99,
        "stock": 100,
        "category": "Electronics",
        "image_url": "🔌",
    },
    {
        "name": "Portable Charger 20000mAh",
        "description": "Fast-charging portable battery pack with dual USB ports.",
        "price": 34.99,
        "stock": 120,
        "category": "Electronics",
        "image_url": "🔋",
    },
    {
        "name": "Webcam 1080p HD",
        "description": "HD webcam with auto-focus and built-in microphone.",
        "price": 59.99,
        "stock": 80,
        "category": "Electronics",
        "image_url": "📷",
    },
    {
        "name": "Bluetooth Speaker",
        "description": "Portable Bluetooth speaker with 360-degree sound.",
        "price": 69.99,
        "stock": 90,
        "category": "Electronics",
        "image_url": "🔊",
    },
    {
        "name": "Phone Stand",
        "description": "Adjustable phone stand for desk or bed.",
        "price": 19.99,
        "stock": 200,
        "category": "Electronics",
        "image_url": "📱",
    },
    {
        "name": "HDMI Cable 2m",
        "description": "High-speed HDMI 2.1 cable for 4K@60Hz.",
        "price": 9.99,
        "stock": 300,
        "category": "Electronics",
        "image_url": "🔗",
    },
    {
        "name": "Laptop Cooling Pad",
        "description": "Aluminum laptop cooler with 5 fans.",
        "price": 39.99,
        "stock": 70,
        "category": "Electronics",
        "image_url": "❄️",
    },
    
    # Footwear - 10 products
    {
        "name": "Premium Running Shoes",
        "description": "Lightweight breathable running shoes with gel cushioning.",
        "price": 129.99,
        "stock": 40,
        "category": "Footwear",
        "image_url": "👟",
    },
    {
        "name": "Running Shoes Sport",
        "description": "Comfortable running shoes for daily training.",
        "price": 84.99,
        "stock": 55,
        "category": "Footwear",
        "image_url": "👟",
    },
    {
        "name": "Casual Sneakers",
        "description": "Stylish casual sneakers with memory foam insole.",
        "price": 74.99,
        "stock": 70,
        "category": "Footwear",
        "image_url": "👟",
    },
    {
        "name": "Basketball Shoes",
        "description": "High-top basketball shoes with ankle support.",
        "price": 139.99,
        "stock": 30,
        "category": "Footwear",
        "image_url": "🏀",
    },
    {
        "name": "Hiking Boots",
        "description": "Waterproof hiking boots with grip sole.",
        "price": 149.99,
        "stock": 35,
        "category": "Footwear",
        "image_url": "🥾",
    },
    {
        "name": "Slip-On Loafers",
        "description": "Comfortable slip-on loafers in leather.",
        "price": 89.99,
        "stock": 50,
        "category": "Footwear",
        "image_url": "👞",
    },
    {
        "name": "Indoor Slippers",
        "description": "Cozy memory foam slippers for all-day comfort.",
        "price": 34.99,
        "stock": 100,
        "category": "Footwear",
        "image_url": "🩴",
    },
    {
        "name": "Sandals",
        "description": "Lightweight adjustable sandals for summer.",
        "price": 44.99,
        "stock": 80,
        "category": "Footwear",
        "image_url": "🩴",
    },
    {
        "name": "Work Boots",
        "description": "Steel-toe work boots with slip resistance.",
        "price": 119.99,
        "stock": 25,
        "category": "Footwear",
        "image_url": "👢",
    },
    {
        "name": "Shoe Inserts Orthopedic",
        "description": "Orthopedic shoe inserts for arch support.",
        "price": 24.99,
        "stock": 150,
        "category": "Footwear",
        "image_url": "👣",
    },
    
    # Sports - 10 products
    {
        "name": "Yoga Mat Premium",
        "description": "Non-slip extra-thick yoga mat with carrying strap.",
        "price": 49.99,
        "stock": 100,
        "category": "Sports",
        "image_url": "🧘",
    },
    {
        "name": "Yoga Mat Standard",
        "description": "Classic yoga mat perfect for beginners.",
        "price": 24.99,
        "stock": 120,
        "category": "Sports",
        "image_url": "🧘",
    },
    {
        "name": "Dumbbell Set",
        "description": "Adjustable dumbbell set 2-15kg.",
        "price": 89.99,
        "stock": 40,
        "category": "Sports",
        "image_url": "💪",
    },
    {
        "name": "Resistance Bands",
        "description": "Set of 5 resistance bands with carrying bag.",
        "price": 19.99,
        "stock": 150,
        "category": "Sports",
        "image_url": "🔄",
    },
    {
        "name": "Pull-Up Bar",
        "description": "Doorway pull-up bar with multiple grip positions.",
        "price": 34.99,
        "stock": 70,
        "category": "Sports",
        "image_url": "🏋️",
    },
    {
        "name": "Foam Roller",
        "description": "Muscle recovery foam roller 45cm.",
        "price": 29.99,
        "stock": 90,
        "category": "Sports",
        "image_url": "🔴",
    },
    {
        "name": "Jump Rope",
        "description": "Speed jump rope with ball bearings.",
        "price": 14.99,
        "stock": 200,
        "category": "Sports",
        "image_url": "🪢",
    },
    {
        "name": "Exercise Ball",
        "description": "Stability ball 65cm with pump included.",
        "price": 39.99,
        "stock": 60,
        "category": "Sports",
        "image_url": "⚽",
    },
    {
        "name": "Yoga Blocks Set",
        "description": "Set of 2 yoga blocks with carrying strap.",
        "price": 19.99,
        "stock": 100,
        "category": "Sports",
        "image_url": "📦",
    },
    {
        "name": "Sports Water Bottle",
        "description": "Leak-proof sports water bottle 750ml.",
        "price": 21.99,
        "stock": 180,
        "category": "Sports",
        "image_url": "💧",
    },
    
    # Kitchen - 12 products
    {
        "name": "Stainless Steel Water Bottle",
        "description": "24oz double-wall insulated bottle, keeps drinks cold 24h.",
        "price": 34.99,
        "stock": 200,
        "category": "Kitchen",
        "image_url": "🍶",
    },
    {
        "name": "Coffee Bean Grinder",
        "description": "Burr grinder with 15 grind settings.",
        "price": 64.99,
        "stock": 50,
        "category": "Kitchen",
        "image_url": "☕",
    },
    {
        "name": "Blender Pro",
        "description": "High-powered blender with 3 speed settings.",
        "price": 119.99,
        "stock": 35,
        "category": "Kitchen",
        "image_url": "🥤",
    },
    {
        "name": "Knife Set",
        "description": "7-piece kitchen knife set with wooden block.",
        "price": 79.99,
        "stock": 45,
        "category": "Kitchen",
        "image_url": "🔪",
    },
    {
        "name": "Cutting Board",
        "description": "Bamboo cutting board with juice grooves.",
        "price": 24.99,
        "stock": 100,
        "category": "Kitchen",
        "image_url": "🪵",
    },
    {
        "name": "Measuring Cups",
        "description": "Stainless steel measuring cups set of 4.",
        "price": 14.99,
        "stock": 150,
        "category": "Kitchen",
        "image_url": "🥄",
    },
    {
        "name": "French Press",
        "description": "Glass French press 800ml with stainless steel frame.",
        "price": 29.99,
        "stock": 80,
        "category": "Kitchen",
        "image_url": "☕",
    },
    {
        "name": "Food Storage Containers",
        "description": "Set of 6 glass food storage containers.",
        "price": 34.99,
        "stock": 90,
        "category": "Kitchen",
        "image_url": "📦",
    },
    {
        "name": "Cast Iron Skillet",
        "description": "10-inch pre-seasoned cast iron skillet.",
        "price": 44.99,
        "stock": 60,
        "category": "Kitchen",
        "image_url": "🍳",
    },
    {
        "name": "Mixing Bowls",
        "description": "Set of 3 stainless steel mixing bowls.",
        "price": 19.99,
        "stock": 120,
        "category": "Kitchen",
        "image_url": "🥣",
    },
    {
        "name": "Dish Drying Rack",
        "description": "Over-sink dish rack with utensil holder.",
        "price": 24.99,
        "stock": 75,
        "category": "Kitchen",
        "image_url": "🧴",
    },
    {
        "name": "Spice Organizer",
        "description": "Wall-mounted spice rack with 12 containers.",
        "price": 39.99,
        "stock": 55,
        "category": "Kitchen",
        "image_url": "🌶️",
    },
    
    # Bags - 8 products
    {
        "name": "Travel Backpack 40L",
        "description": "Large 40L travel backpack with multiple compartments.",
        "price": 89.99,
        "stock": 45,
        "category": "Bags",
        "image_url": "🎒",
    },
    {
        "name": "Laptop Backpack",
        "description": "30L backpack with laptop compartment and USB port.",
        "price": 74.99,
        "stock": 60,
        "category": "Bags",
        "image_url": "💼",
    },
    {
        "name": "Gym Duffel Bag",
        "description": "Large capacity gym bag with shoe compartment.",
        "price": 49.99,
        "stock": 70,
        "category": "Bags",
        "image_url": "🏋️",
    },
    {
        "name": "Crossbody Sling Bag",
        "description": "Lightweight crossbody bag for daily essentials.",
        "price": 39.99,
        "stock": 85,
        "category": "Bags",
        "image_url": "👜",
    },
    {
        "name": "Tote Bag Canvas",
        "description": "Canvas tote bag perfect for shopping or work.",
        "price": 24.99,
        "stock": 120,
        "category": "Bags",
        "image_url": "🛍️",
    },
    {
        "name": "Camera Bag",
        "description": "Camera backpack with tripod holder.",
        "price": 69.99,
        "stock": 35,
        "category": "Bags",
        "image_url": "📷",
    },
    {
        "name": "Packing Cubes Set",
        "description": "Set of 3 packing cubes for organized travel.",
        "price": 19.99,
        "stock": 100,
        "category": "Bags",
        "image_url": "📦",
    },
    {
        "name": "Waist Pack",
        "description": "Water-resistant waist pack for outdoor activities.",
        "price": 29.99,
        "stock": 90,
        "category": "Bags",
        "image_url": "👝",
    },
    
    # Accessories - 10 products
    {
        "name": "Sunglasses UV400",
        "description": "Polarized UV400 sunglasses in matte black.",
        "price": 49.99,
        "stock": 100,
        "category": "Accessories",
        "image_url": "😎",
    },
    {
        "name": "Aviator Sunglasses",
        "description": "Classic aviator style sunglasses.",
        "price": 59.99,
        "stock": 80,
        "category": "Accessories",
        "image_url": "😎",
    },
    {
        "name": "Watch",
        "description": "Classic analog watch with leather strap.",
        "price": 79.99,
        "stock": 50,
        "category": "Accessories",
        "image_url": "⌚",
    },
    {
        "name": "Wallet RFID",
        "description": "RFID blocking wallet with multiple card slots.",
        "price": 34.99,
        "stock": 120,
        "category": "Accessories",
        "image_url": "💳",
    },
    {
        "name": "Belt",
        "description": "Leather belt with metal buckle.",
        "price": 39.99,
        "stock": 90,
        "category": "Accessories",
        "image_url": "🪢",
    },
    {
        "name": "Scarf",
        "description": "Wool scarf with fringe trim.",
        "price": 29.99,
        "stock": 70,
        "category": "Accessories",
        "image_url": "🧣",
    },
    {
        "name": "Beanie",
        "description": "Wool beanie in multiple colors.",
        "price": 19.99,
        "stock": 150,
        "category": "Accessories",
        "image_url": "🧢",
    },
    {
        "name": "Sunscreen SPF50",
        "description": "Waterproof sunscreen SPF 50+.",
        "price": 14.99,
        "stock": 200,
        "category": "Accessories",
        "image_url": "☀️",
    },
    {
        "name": "Sunglasses Case",
        "description": "Hard protective case for sunglasses.",
        "price": 12.99,
        "stock": 100,
        "category": "Accessories",
        "image_url": "📦",
    },
    {
        "name": "Lip Balm",
        "description": "SPF 30 lip balm with natural ingredients.",
        "price": 7.99,
        "stock": 250,
        "category": "Accessories",
        "image_url": "💄",
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

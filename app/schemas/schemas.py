from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional, List

# ── User Schemas ───────────────────────────────────────────────
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str

class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ── Product Schemas ────────────────────────────────────────────
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category: str
    image_url: Optional[str] = None

    @field_validator("name", "description", "category")
    @classmethod
    def non_empty_text(cls, v: str) -> str:
        value = v.strip()
        if not value:
            raise ValueError("Field cannot be empty")
        return value

    @field_validator("price")
    @classmethod
    def non_negative_price(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Price must be non-negative")
        return v

    @field_validator("stock")
    @classmethod
    def non_negative_stock(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Stock must be non-negative")
        return v

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None

    @field_validator("name", "description", "category")
    @classmethod
    def non_empty_optional_text(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        value = v.strip()
        if not value:
            raise ValueError("Field cannot be empty")
        return value

    @field_validator("price")
    @classmethod
    def non_negative_optional_price(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError("Price must be non-negative")
        return v

    @field_validator("stock")
    @classmethod
    def non_negative_optional_stock(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("Stock must be non-negative")
        return v

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ── Cart Schemas ───────────────────────────────────────────────
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Quantity must be at least 1")
        return v

class CartItem(BaseModel):
    id: int
    product_id: int
    quantity: int
    added_at: datetime

    class Config:
        from_attributes = True

class CartItemWithProduct(CartItem):
    product: Product

# ── Order Schemas ──────────────────────────────────────────────
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class OrderItem(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float

    class Config:
        from_attributes = True

class OrderItemWithProduct(OrderItem):
    product: Product

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

class Order(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemWithProduct] = []

    class Config:
        from_attributes = True

# ── Auth Schemas ───────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

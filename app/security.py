"""Security utilities for the DFCommerce application."""

from fastapi import HTTPException, status
import html
from typing import Any


def sanitize_input(value: str, max_length: int = 500) -> str:
    """
    Sanitize user input to prevent XSS attacks.
    
    Args:
        value: The input string to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized string
    """
    if not isinstance(value, str):
        raise HTTPException(status_code=400, detail="Invalid input type")
    
    if len(value) > max_length:
        raise HTTPException(
            status_code=400, 
            detail=f"Input exceeds maximum length of {max_length} characters"
        )
    
    # HTML escape to prevent XSS
    return html.escape(value.strip())


def validate_price(price: float) -> float:
    """Validate price is positive and reasonable."""
    if price < 0:
        raise HTTPException(status_code=400, detail="Price cannot be negative")
    if price > 999999.99:
        raise HTTPException(status_code=400, detail="Price exceeds maximum allowed value")
    return round(price, 2)


def validate_quantity(quantity: int) -> int:
    """Validate quantity is positive."""
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")
    if quantity > 10000:
        raise HTTPException(status_code=400, detail="Quantity exceeds maximum allowed value")
    return quantity

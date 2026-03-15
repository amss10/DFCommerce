"""Tests for DFCommerce authentication."""

import pytest
from fastapi.testclient import TestClient
from app.database.database import Base, SessionLocal
from main import app
from app.models.models import User
from app.auth import get_password_hash


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def db():
    """Create test database."""
    Base.metadata.create_all(bind=SessionLocal().get_bind())
    yield SessionLocal()
    Base.metadata.drop_all(bind=SessionLocal().get_bind())


def test_register_user(client):
    """Test user registration."""
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User",
            "password": "TestPassword123",
        }
    )
    assert response.status_code == 201
    assert response.json()["username"] == "testuser"


def test_register_duplicate_email(client):
    """Test registration with duplicate email."""
    client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser1",
            "full_name": "Test User",
            "password": "TestPassword123",
        }
    )
    
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser2",
            "full_name": "Test User 2",
            "password": "TestPassword123",
        }
    )
    assert response.status_code == 400


def test_weak_password(client):
    """Test registration with weak password."""
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User",
            "password": "short",  # Less than 8 characters
        }
    )
    assert response.status_code == 422  # Validation error


def test_login(client):
    """Test user login."""
    # Register first
    client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User",
            "password": "TestPassword123",
        }
    )
    
    # Login
    response = client.post(
        "/auth/login",
        data={"username": "testuser", "password": "TestPassword123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_invalid_credentials(client):
    """Test login with wrong credentials."""
    response = client.post(
        "/auth/login",
        data={"username": "nonexistent", "password": "wrongpassword"}
    )
    assert response.status_code == 401

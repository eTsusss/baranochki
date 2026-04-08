from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import Product, User
from app.auth import hash_password


client = TestClient(app)

def setup_module():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(Product).count() == 0:
        db.add(Product(name="Candy", description="d", price=100, image_url="u", weight="100g", category="candies"))
    if not db.query(User).filter(User.email == "admin@example.com").first():
        db.add(User(email="admin@example.com", hashed_password=hash_password("admin"), role="admin"))
    db.commit()
    db.close()


def _user_token(email: str):
    reg = client.post("/api/auth/register", json={"email": email, "password": "123456"})
    if reg.status_code == 200 and "access_token" in reg.json():
        return reg.json()["access_token"]
    login = client.post("/api/auth/login", json={"email": email, "password": "123456"})
    return login.json()["access_token"]


def test_create_order_returns_201():
    token = _user_token("u1@example.com")
    products = client.get("/api/products").json()
    payload = {
        "customer_name": "Ivan",
        "phone": "+79990001122",
        "address": "Moscow",
        "items": [{"product_id": products[0]["id"], "quantity": 1}],
    }
    r = client.post("/api/orders", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 201
    created = r.json()
    assert created["id"] > 0

    user_orders = client.get("/api/orders/me", headers={"Authorization": f"Bearer {token}"})
    assert user_orders.status_code == 200
    assert any(o["id"] == created["id"] for o in user_orders.json())

    admin_login = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "admin"})
    admin_token = admin_login.json()["access_token"]
    all_orders = client.get("/api/orders", headers={"Authorization": f"Bearer {admin_token}"})
    assert all_orders.status_code == 200
    assert any(o["id"] == created["id"] for o in all_orders.json())


def test_admin_users_requires_admin_role():
    token = _user_token("u2@example.com")
    r = client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403


def test_admin_users_for_admin():
    login = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "admin"})
    token = login.json()["access_token"]
    r = client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)

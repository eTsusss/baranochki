from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _admin_token() -> str:
    login = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "admin"})
    return login.json()["access_token"]


def test_admin_can_create_update_delete_product():
    token = _admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    create_payload = {
        "name": "Тестовый товар CRUD",
        "description": "Проверка создания",
        "price": 333,
        "image_url": "/images/products/default.svg",
        "weight": "123 г",
        "category": "candies",
    }
    created = client.post("/api/products", json=create_payload, headers=headers)
    assert created.status_code == 200
    product = created.json()
    product_id = product["id"]

    update_payload = {
        "name": "Тестовый товар CRUD (обновлен)",
        "description": "Проверка редактирования",
        "price": 444,
        "image_url": "/images/products/default.svg",
        "weight": "124 г",
        "category": "baranochki",
    }
    updated = client.put(f"/api/products/{product_id}", json=update_payload, headers=headers)
    assert updated.status_code == 200
    assert updated.json()["name"] == update_payload["name"]
    assert updated.json()["price"] == update_payload["price"]

    deleted = client.delete(f"/api/products/{product_id}", headers=headers)
    assert deleted.status_code == 200
    assert deleted.json().get("ok") is True

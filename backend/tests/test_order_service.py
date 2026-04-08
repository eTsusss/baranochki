from dataclasses import dataclass
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Product
from app.services.order_service import OrderService


@dataclass
class Item:
    product_id: int
    quantity: int


@dataclass
class Payload:
    customer_name: str
    phone: str
    address: str
    items: list[Item]


def test_order_service_create_calculates_total():
    engine = create_engine("sqlite:///:memory:")
    Session = sessionmaker(bind=engine)
    Base.metadata.create_all(engine)

    db = Session()
    db.add(Product(name="Candy", description="d", price=120, image_url="u", weight="100g", category="candies"))
    db.commit()

    payload = Payload(customer_name="Ivan", phone="123", address="Street", items=[Item(product_id=1, quantity=3)])
    order = OrderService().create(db, payload, user_id=1)

    assert order.total == 360
    assert len(order.items) == 1
    assert order.items[0].quantity == 3

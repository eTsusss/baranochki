from sqlalchemy.orm import Session
from ..models import Order, OrderItem, Product

class OrderService:
    def create(self, db: Session, data, user_id=None):
        order = Order(
            user_id=user_id,
            customer_name=data.customer_name,
            phone=data.phone,
            address=data.address,
            status="new",
            total=0,
        )
        db.add(order)
        db.flush()

        total = 0.0
        for item in data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                continue
            total += product.price * item.quantity
            db.add(OrderItem(order_id=order.id, product_id=product.id, quantity=item.quantity, price=product.price))

        order.total = round(total, 2)
        db.commit()
        db.refresh(order)
        return order

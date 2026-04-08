from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user, admin_required
from ..models import Order
from ..schemas import OrderCreateRequest, OrderOut, OrderStatusUpdate
from ..services.order_service import OrderService

router = APIRouter(prefix="/api/orders", tags=["orders"])
svc = OrderService()

@router.post("", response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreateRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return svc.create(db, payload, user_id=user.id)

@router.get("/me", response_model=list[OrderOut])
def my_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Order).filter(Order.user_id == user.id).order_by(Order.id.desc()).all()

@router.get("", response_model=list[OrderOut])
def all_orders(db: Session = Depends(get_db), _=Depends(admin_required)):
    return db.query(Order).order_by(Order.id.desc()).all()

@router.patch("/{order_id}/status", response_model=OrderOut)
def update_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db), _=Depends(admin_required)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order

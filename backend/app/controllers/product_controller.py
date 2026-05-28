from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import admin_required
from ..models import Product
from ..schemas import ProductIn, ProductOut

router = APIRouter(prefix="/api/products", tags=["products"])
LEGACY_TEST_PRODUCT_NAMES = {
    "Трюфельный набор",
    "Карамель с морской солью",
    "Бараночки медовые",
    "Бараночки с маком",
    "Капкейк ванильный",
    "Капкейк ягодный",
    "Набор конфет",
    "Candy",
}

@router.get("", response_model=list[ProductOut])
def list_products(category: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Product).filter(~Product.name.in_(LEGACY_TEST_PRODUCT_NAMES))
    if category:
        q = q.filter(Product.category == category)
    return q.all()

@router.post("", response_model=ProductOut)
def create_product(payload: ProductIn, db: Session = Depends(get_db), _=Depends(admin_required)):
    p = Product(**payload.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductIn, db: Session = Depends(get_db), _=Depends(admin_required)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in payload.model_dump().items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), _=Depends(admin_required)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        return {"ok": False}
    db.delete(p)
    db.commit()
    return {"ok": True}

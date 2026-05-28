from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pathlib import Path
from urllib.parse import urlparse
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
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def _to_absolute_image_url(request: Request, image_url: str) -> str:
    if not image_url:
        return image_url
    if image_url.startswith("http://") or image_url.startswith("https://") or image_url.startswith("data:image/"):
        return image_url
    if image_url.startswith("/"):
        return f"{str(request.base_url).rstrip('/')}{image_url}"
    return image_url


def _extract_relative_image_path(image_url: str) -> str | None:
    if not image_url:
        return None
    path = image_url
    if image_url.startswith("http://") or image_url.startswith("https://"):
        path = urlparse(image_url).path
    if not path.startswith("/images/"):
        return None
    return path.removeprefix("/images/")


def _images_roots() -> list[Path]:
    backend_root = Path(__file__).resolve().parents[2] / "public" / "images"
    frontend_root = Path(__file__).resolve().parents[3] / "frontend" / "public" / "images"
    roots: list[Path] = []
    if backend_root.exists():
        roots.append(backend_root)
    if frontend_root.exists():
        roots.append(frontend_root)
    return roots


def _build_image_gallery(request: Request, image_url: str) -> list[str]:
    relative_path = _extract_relative_image_path(image_url)
    if not relative_path:
        return [_to_absolute_image_url(request, image_url)] if image_url else []

    rel_path = Path(relative_path)
    folder = rel_path.parent
    primary_name = rel_path.name
    file_names: list[str] = []
    for root in _images_roots():
        dir_path = root / folder
        if not dir_path.exists() or not dir_path.is_dir():
            continue
        names = [
            child.name
            for child in sorted(dir_path.iterdir(), key=lambda p: p.name.lower())
            if child.is_file() and child.suffix.lower() in IMAGE_EXTENSIONS
        ]
        if names:
            file_names = names
            break

    if not file_names:
        return [_to_absolute_image_url(request, image_url)]

    if primary_name in file_names:
        file_names = [primary_name, *[name for name in file_names if name != primary_name]]

    return [
        _to_absolute_image_url(request, f"/images/{(folder / name).as_posix()}")
        for name in file_names
    ]

@router.get("", response_model=list[ProductOut])
def list_products(request: Request, category: str | None = None, db: Session = Depends(get_db)):
    q = (
        db.query(Product)
        .filter(~Product.name.in_(LEGACY_TEST_PRODUCT_NAMES))
        .filter(~Product.image_url.like("/images/products/%"))
        .filter(~Product.image_url.like("data:image/%"))
    )
    if category:
        q = q.filter(Product.category == category)
    products = q.all()
    payload: list[dict] = []
    for product in products:
        image_url = _to_absolute_image_url(request, product.image_url)
        image_gallery = _build_image_gallery(request, product.image_url)
        payload.append(
            {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "image_url": image_url,
                "image_gallery": image_gallery,
                "weight": product.weight,
                "category": product.category,
            }
        )
    return payload

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

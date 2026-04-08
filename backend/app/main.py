from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from .models import Product, User
from .auth import hash_password
from .controllers.auth_controller import router as auth_router
from .controllers.product_controller import router as product_router
from .controllers.order_controller import router as order_router
from .controllers.admin_controller import router as admin_router

app = FastAPI(title="Confeti Baranochki API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth_router)
app.include_router(product_router)
app.include_router(order_router)
app.include_router(admin_router)

def _fallback_image(category: str, idx: int) -> str:
    if category == "candies":
        return "/images/products/candies.svg"
    if category == "baranochki":
        return "/images/products/baranochki.svg"
    if category == "cupcakes":
        return "/images/products/cupcakes.svg"
    return "/images/products/default.svg"

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_products = [
        Product(
            name="Трюфельный набор",
            description="Тёмный шоколад с бархатной текстурой и какао.",
            price=390,
            image_url="/images/products/candies.svg",
            weight="180 г",
            category="candies"
        ),
        Product(
            name="Карамель с морской солью",
            description="Мягкие конфеты с солёной карамельной начинкой.",
            price=320,
            image_url="/images/products/candies.svg",
            weight="160 г",
            category="candies"
        ),
        Product(
            name="Бараночки медовые",
            description="Румяные бараночки с лёгкой медовой глазурью.",
            price=210,
            image_url="/images/products/baranochki.svg",
            weight="220 г",
            category="baranochki"
        ),
        Product(
            name="Бараночки с маком",
            description="Хрустящие бараночки для чая с ароматным маком.",
            price=220,
            image_url="/images/products/baranochki.svg",
            weight="210 г",
            category="baranochki"
        ),
        Product(
            name="Капкейк ванильный",
            description="Ванильный бисквит с кремом и ягодным декором.",
            price=190,
            image_url="/images/products/cupcakes.svg",
            weight="110 г",
            category="cupcakes"
        ),
        Product(
            name="Капкейк ягодный",
            description="Нежный капкейк с ягодным кремом и хрустящей крошкой.",
            price=200,
            image_url="/images/products/cupcakes.svg",
            weight="115 г",
            category="cupcakes"
        ),
    ]

    existing_names = {p.name for p in db.query(Product).all()}
    for product in seed_products:
        if product.name not in existing_names:
            db.add(product)

    for p in db.query(Product).all():
        if not p.image_url or p.image_url == "u" or "via.placeholder.com" in p.image_url or p.image_url.startswith("http"):
            p.image_url = _fallback_image(p.category, p.id)
        if p.price < 100:
            p.price = round(p.price * 18)
        if p.name == "Candy":
            p.name = "Набор конфет"
            p.description = "Ассорти конфет ручной работы"
            p.weight = "150 г"
            p.category = "candies"
            p.image_url = _fallback_image("candies", p.id)
    if not db.query(User).filter(User.email == "admin@example.com").first():
        db.add(User(email="admin@example.com", hashed_password=hash_password("admin"), role="admin"))
    db.commit()
    db.close()

@app.get("/health")
def health():
    return {"ok": True}

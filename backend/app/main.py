from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from .models import Product, User, OrderItem
from .auth import hash_password
from .controllers.auth_controller import router as auth_router
from .controllers.product_controller import router as product_router
from .controllers.order_controller import router as order_router
from .controllers.admin_controller import router as admin_router

app = FastAPI(title="Confeti Baranochki API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
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
    test_product_names = {
        "Трюфельный набор",
        "Карамель с морской солью",
        "Бараночки медовые",
        "Бараночки с маком",
        "Капкейк ванильный",
        "Капкейк ягодный",
        "Набор конфет",
        "Candy",
    }
    used_product_ids = {product_id for (product_id,) in db.query(OrderItem.product_id).distinct().all() if product_id is not None}
    removable_test_products = db.query(Product).filter(Product.name.in_(test_product_names))
    if used_product_ids:
        removable_test_products = removable_test_products.filter(~Product.id.in_(used_product_ids))
    removable_test_products.delete(synchronize_session=False)
    seed_products = [
        Product(
            name="Кофе Ambassador Gold",
            description="Сбалансированный растворимый кофе с мягким вкусом, деликатной горчинкой и насыщенным ароматом для ежедневных кофейных пауз.",
            price=490,
            image_url="/images/ambassador/photo_2025-02-19_16-31-54.jpg",
            weight="95 г",
            category="candies"
        ),
        Product(
            name="Чай Basilur Ассорти",
            description="Коллекция цейлонского чая с ярким ароматическим профилем и благородным вкусом. Отлично подходит для подарка и уютных чаепитий.",
            price=650,
            image_url="/images/basilur/photo_2026-03-06_12-32-08.jpg",
            weight="100 г",
            category="candies"
        ),
        Product(
            name="Чай Basilur Премиум",
            description="Премиальный листовой чай с выразительными нотами и плотным послевкусием. Идеален для спокойного вечернего чаепития.",
            price=690,
            image_url="/images/basilur2/photo_2026-02-23_13-07-46.jpg",
            weight="100 г",
            category="candies"
        ),
        Product(
            name="Кофе Carte Noire Original",
            description="Ароматный кофе с глубоким обжаренным вкусом и шоколадными нюансами. Подходит для приготовления насыщенного утреннего напитка.",
            price=520,
            image_url="/images/carteNoire/photo_2026-03-08_12-45-49.jpg",
            weight="95 г",
            category="candies"
        ),
        Product(
            name="Кофе Carte Noire Intense",
            description="Интенсивный кофе с плотным телом и выразительным послевкусием. Хороший выбор для тех, кто любит яркий и крепкий вкус.",
            price=540,
            image_url="/images/carteNoire2/photo_2026-03-08_12-44-14.jpg",
            weight="95 г",
            category="candies"
        ),
        Product(
            name="Кофе Monarch Classic",
            description="Классический кофе с мягкой обжаркой и приятным ароматом. Универсальный вариант для дома и офиса на каждый день.",
            price=470,
            image_url="/images/monarch/photo_2025-10-03_19-33-44.jpg",
            weight="95 г",
            category="candies"
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
    if not db.query(User).filter(User.email == "admin@example.com").first():
        db.add(User(email="admin@example.com", hashed_password=hash_password("admin"), role="admin"))
    db.commit()
    db.close()

@app.get("/health")
def health():
    return {"ok": True}

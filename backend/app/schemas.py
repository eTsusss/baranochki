from pydantic import BaseModel, EmailStr
from typing import List

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ProductIn(BaseModel):
    name: str
    description: str
    price: float
    image_url: str
    weight: str
    category: str

class ProductOut(ProductIn):
    id: int
    class Config:
        from_attributes = True

class CartItem(BaseModel):
    product_id: int
    quantity: int

class OrderCreateRequest(BaseModel):
    customer_name: str
    phone: str
    address: str
    items: List[CartItem]

class OrderStatusUpdate(BaseModel):
    status: str

class OrderItemOut(BaseModel):
    product_id: int
    quantity: int
    price: float
    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    customer_name: str
    phone: str
    address: str
    status: str
    total: float
    items: List[OrderItemOut]
    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    class Config:
        from_attributes = True

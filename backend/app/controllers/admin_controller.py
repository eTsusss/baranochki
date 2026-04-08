from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import admin_required
from ..models import User
from ..schemas import UserOut

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/users", response_model=list[UserOut])
def users(db: Session = Depends(get_db), _=Depends(admin_required)):
    return db.query(User).all()

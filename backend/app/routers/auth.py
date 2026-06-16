from fastapi import APIRouter, HTTPException, status
from app.database import supabase
from app import schemas
from app.auth import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=schemas.Token, summary="Admin login", description="Authenticates admin and returns a JWT Bearer token. Use this token in the Authorize button above.")
def login(payload: schemas.AdminLogin):
    res = supabase.table("admins").select("*").eq("username", payload.username).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    admin = res.data[0]
    if not verify_password(payload.password, admin["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": admin["username"]})
    return {"access_token": token, "token_type": "bearer"}

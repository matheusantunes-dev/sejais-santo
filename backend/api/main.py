from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
import requests
from jose import jwt

from supabase_storage import SupabaseStorage


# =========================
# FASTAPI APP
# =========================

app = FastAPI(title="Sejais Santo Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # depois você restringe
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# STORAGE FACTORY (IMPORTANTE)
# =========================

def get_storage():
    return SupabaseStorage(table_name="verses")


# =========================
# MODELS
# =========================

class VerseCreate(BaseModel):
    text: str
    note: Optional[str] = None
    scheduledAt: Optional[str] = None


class VerseUpdate(BaseModel):
    id: str
    text: Optional[str] = None
    note: Optional[str] = None
    scheduledAt: Optional[str] = None


# =========================
# AUTH
# =========================

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No auth header")

    try:
        token = authorization.split(" ")[1]
        payload = jwt.get_unverified_claims(token)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {"sub": user_id}

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# =========================
# HEALTH CHECK
# =========================

@app.get("/")
def health():
    return {"status": "alive"}


# =========================
# VERSES ENDPOINTS
# =========================

@app.get("/verses")
def list_verses(
    user=Depends(get_current_user),
    authorization: str = Header(...)
):
    storage = get_storage()
    user_id = user["sub"]
    token = authorization.split(" ")[1]
    return storage.list_verses_for(user_id, token)


@app.post("/verses")
def create_verse(
    payload: VerseCreate,
    user=Depends(get_current_user),
    authorization: str = Header(...)
):
    storage = get_storage()
    user_id = user["sub"]
    token = authorization.split(" ")[1]
    return storage.create_verse(user_id, token, payload.dict())


@app.delete("/verses")
def delete_verse(
    data: dict,
    user=Depends(get_current_user),
    authorization: str = Header(...)
):
    storage = get_storage()
    user_id = user["sub"]
    token = authorization.split(" ")[1]
    verse_id = data.get("id")

    storage.delete_verse(user_id, token, verse_id)
    return {"status": "deleted"}


# =========================
# GOSPEL ENDPOINT
# =========================

@app.get("/gospel")
def get_gospel():
    try:
        response = requests.get(
            "https://liturgia.up.railway.app/v2",
            headers={
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            },
            timeout=10
        )

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Erro na API externa")

        return response.json()

    except requests.RequestException:
        raise HTTPException(status_code=500, detail="Erro ao buscar evangelho")

from fastapi.middleware.cors import CORSMiddleware
import os
from typing import Optional
from datetime import date
import requests

from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel

from jose import jwt

from supabase_storage import SupabaseStorage

storage = SupabaseStorage(table_name="verses")

# =========================
# FASTAPI APP
# =========================

app = FastAPI(title="Sejais Santo Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    token = authorization.split(" ")[1]

    try:
        payload = jwt.get_unverified_claims(token)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {"sub": user_id}

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# =========================
# VERSES ENDPOINTS
# =========================

@app.get("/api/verses")
def list_verses(user=Depends(get_current_user), authorization: str = Header(...)):
    user_id = user["sub"]
    token = authorization.split(" ")[1]
    return storage.list_verses_for(user_id, token)


@app.post("/api/verses")
def create_verse(
    payload: VerseCreate,
    user=Depends(get_current_user),
    authorization: str = Header(...),
):
    user_id = user["sub"]
    token = authorization.split(" ")[1]
    return storage.create_verse(user_id, token, payload.dict())


@app.delete("/api/verses")
def delete_verse(
    data: dict, user=Depends(get_current_user), authorization: str = Header(...)
):
    user_id = user["sub"]
    token = authorization.split(" ")[1]
    verse_id = data.get("id")

    storage.delete_verse(user_id, token, verse_id)
    return {"status": "deleted"}


# =========================
# GOSPEL ENDPOINT (NOVO)
# =========================

cached_data = None
cached_date = None

@app.get("/api/gospel")
def get_gospel():
    try:
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json"
        }

        response = requests.get(
            "https://liturgia.up.railway.app/v2",
            headers=headers,
            timeout=10
        )

        if response.status_code != 200:
            print("STATUS EXTERNO:", response.status_code)
            print("BODY:", response.text)
            raise HTTPException(status_code=500, detail="Erro na API externa")

        return response.json()

    except requests.RequestException as e:
        print("ERRO REQUEST:", e)
        raise HTTPException(status_code=500, detail="Erro ao buscar evangelho")

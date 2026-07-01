from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
import requests
from jose import jwt, JWTError
import os
from datetime import date

from api.supabase_storage import SupabaseStorage
from api.gospel_cache import get_today_gospel, save_today_gospel
from api.bible import router as bible_router
from api.liturgical_lib import (
    liturgical_color, color_label, get_today_liturgical, resolve_date,
)
from api.saints_calendar import today_saint, upcoming_saints
from api.lectionary_data import lookup as lectionary_lookup


# =========================
# FASTAPI APP
# =========================

app = FastAPI(title="Sejais Santo Backend")

origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://sejais-santo.vercel.app",
    "https://sejais-santo.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(bible_router)

# =========================
# STORAGE FACTORY
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
        secret = os.getenv("SUPABASE_JWT_SECRET")
        if not secret:
            raise HTTPException(status_code=500, detail="JWT secret not configured")

        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {"sub": user_id}

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# =========================
# HEALTH CHECK
# =========================

@app.get("/")
def health():
    return {"status": "alive, ok"}


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
# LITURGICAL ENDPOINTS
# =========================

@app.get("/liturgical/today")
def liturgical_today():
    today = date.today()
    resolved = resolve_date(today)
    color = liturgical_color(today)
    saint = today_saint()
    lectionary_entry = None
    if resolved.get("key"):
        lectionary_entry = lectionary_lookup(resolved["key"])

    response = {
        "date": today.isoformat(),
        "season": resolved["season"],
        "cycle": resolved["cycle"],
        "ferial": resolved["ferial"],
        "week": resolved["week"],
        "liturgical_key": resolved.get("key"),
        "color": color,
        "color_label": color_label(color),
        "saint": saint,
    }
    if lectionary_entry:
        response["pericope"] = lectionary_entry[0]
        response["book_abbrev"] = lectionary_entry[1]

    return response


@app.get("/liturgical/color")
def liturgical_color_endpoint():
    today = date.today()
    color = liturgical_color(today)
    return {
        "theme": color,
        "label": color_label(color),
        "date": today.isoformat(),
    }


@app.get("/liturgical/saints")
def liturgical_saints():
    return {
        "today": today_saint(),
        "upcoming": upcoming_saints(5),
    }


# =========================
# GOSPEL ENDPOINT
# =========================

@app.get("/gospel")
def get_gospel():
    cached = get_today_gospel()
    if cached:
        liturgical = None
        if cached.get("liturgical_key"):
            lectionary_entry = lectionary_lookup(cached["liturgical_key"])
            liturgical = {
                "season": cached.get("liturgical_season"),
                "cycle": cached.get("sunday_cycle"),
                "ferial": cached.get("ferial_cycle"),
                "week": cached.get("week_number"),
                "pericope": cached.get("pericope") or (lectionary_entry[0] if lectionary_entry else None),
                "book_abbrev": cached.get("book_abbrev") or (lectionary_entry[1] if lectionary_entry else None),
                "liturgical_key": cached.get("liturgical_key"),
            }

        return {
            "cached": True,
            "leituras": {
                "evangelho": [{
                    "referencia": cached["referencia"],
                    "texto": cached["texto"],
                }]
            },
            "liturgical": liturgical,
        }

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

        data = response.json()
        evangelho = (data or {}).get("leituras", {}).get("evangelho", [])
        if evangelho:
            today = date.today()
            resolved = resolve_date(today)
            ref = evangelho[0].get("referencia", "")
            txt = evangelho[0].get("texto", "")
            save_today_gospel(
                referencia=ref,
                texto=txt,
                liturgical_season=resolved.get("season"),
                sunday_cycle=resolved.get("cycle"),
                ferial_cycle=resolved.get("ferial"),
                week_number=resolved.get("week"),
                liturgical_key=resolved.get("key"),
            )

        return data

    except requests.RequestException:
        raise HTTPException(status_code=500, detail="Erro ao buscar evangelho")

import time
import logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
import requests
from jose import JWTError, jws
import jwt as pyjwt
from jwt import PyJWKClient, PyJWTError
import os
from datetime import date

logger = logging.getLogger(__name__)

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

SUPABASE_URL = os.getenv("SUPABASE_URL")
_jwks_client = None


def _get_jwks():
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        logger.info("Initializing PyJWKClient for %s", jwks_url)
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


def get_current_user(authorization: str = Header(None)):
    logger.warning("AUTH VERSION: JWKS V2")
    if not authorization:
        raise HTTPException(status_code=401, detail="No auth header")

    header = {}

    try:
        token = authorization.split(" ")[1]

        try:
            h = jws.get_unverified_header(token)
            logger.warning("JWT header: kid=%s alg=%s typ=%s",
                           h.get("kid"), h.get("alg"), h.get("typ"))
            header = h
        except Exception as e:
            logger.warning("Could not parse JWT header: %s", str(e))

        if not SUPABASE_URL:
            raise HTTPException(status_code=500, detail="SUPABASE_URL not configured")

        signing_key = _get_jwks().get_signing_key_from_jwt(token)

        payload = pyjwt.decode(
            token,
            signing_key.key,
            algorithms=[signing_key.algorithm_name],
            audience="authenticated",
            leeway=300,
        )
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no sub")

        return {"sub": user_id}

    except PyJWTError as e:
        logger.warning("JWT decode failed: alg=%s error=%s",
                       header.get("alg", "unknown"), str(e))
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
    user=Depends(get_current_user)
):
    try:
        storage = get_storage()
        user_id = user["sub"]
        return storage.list_verses_for(user_id)
    except Exception as e:
        logger.exception("list_verses failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/verses")
def create_verse(
    payload: VerseCreate,
    user=Depends(get_current_user)
):
    try:
        storage = get_storage()
        user_id = user["sub"]
        return storage.create_verse(user_id, payload.dict())
    except Exception as e:
        logger.exception("create_verse failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/verses")
def delete_verse(
    data: dict,
    user=Depends(get_current_user)
):
    try:
        storage = get_storage()
        user_id = user["sub"]
        verse_id = data.get("id")
        storage.delete_verse(user_id, verse_id)
        return {"status": "deleted"}
    except Exception as e:
        logger.exception("delete_verse failed")
        raise HTTPException(status_code=500, detail=str(e))


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
    t_start = time.monotonic()
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

        t_total = (time.monotonic() - t_start) * 1000
        logger.warning("GOSPEL_ENDPOINT total=%.0fms source=cache", t_total)

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
        t_ext = time.monotonic()
        response = requests.get(
            "https://liturgia.up.railway.app/v2",
            headers={
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            },
            timeout=10
        )

        t_ext_done = time.monotonic()

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Erro na API externa")

        data = response.json()
        t_parse = time.monotonic()
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

        t_save_done = time.monotonic()
        t_total = (t_save_done - t_start) * 1000
        t_api = (t_ext_done - t_ext) * 1000
        t_parse_ms = (t_parse - t_ext_done) * 1000
        t_save_ms = (t_save_done - t_parse) * 1000
        logger.warning(
            "GOSPEL_ENDPOINT total=%.0fms source=fetch api=%.0fms parse=%.0fms save=%.0fms",
            t_total, t_api, t_parse_ms, t_save_ms)

        return data

    except requests.RequestException:
        raise HTTPException(status_code=500, detail="Erro ao buscar evangelho")

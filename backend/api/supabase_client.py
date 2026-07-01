from supabase import create_client, ClientOptions
import os


def get_supabase_client(auth_token: str | None = None):
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url:
        raise RuntimeError("SUPABASE_URL not configured")

    if auth_token:
        key = supabase_anon_key or ""
        headers = {"Authorization": f"Bearer {auth_token}"}
    else:
        key = supabase_service_key or supabase_anon_key or ""
        headers = None

    if not key:
        raise RuntimeError("No Supabase key configured")

    return create_client(
        supabase_url, key,
        options=ClientOptions(headers=headers) if headers else None,
    )


def get_service_client():
    return get_supabase_client()

from supabase import create_client, ClientOptions
import os


def get_supabase_client(user_jwt: str):
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_anon_key:
        raise RuntimeError("Supabase environment variables not configured")

    return create_client(
        supabase_url,
        supabase_anon_key,
        options=ClientOptions(
            headers={
                "Authorization": f"Bearer {user_jwt}"
            }
        )
    )

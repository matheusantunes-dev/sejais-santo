from supabase import create_client, ClientOptions
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

def get_supabase_client(user_jwt: str):
    return create_client(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        options=ClientOptions(
            headers={
                "Authorization": f"Bearer {user_jwt}"
            }
        )
    )
from typing import List, Dict
from datetime import datetime, timezone
import uuid

from api.supabase_client import get_supabase_client


class SupabaseStorage:
    def __init__(self, table_name: str = "verses"):
        self.table = table_name

    def list_verses_for(self, user_id: str, user_jwt: str) -> List[Dict]:
        supabase = get_supabase_client(user_jwt)

        response = (
            supabase
            .table(self.table)
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1000)
            .execute()
        )

        rows = response.data or []

        return [
            {
                "id": r.get("id"),
                "text": r.get("text"),
                "note": r.get("note"),
                "createdAt": r.get("created_at"),
                "scheduledAt": r.get("scheduled_at"),
            }
            for r in rows
        ]

    def create_verse(self, user_id: str, user_jwt: str, payload: Dict) -> Dict:
        supabase = get_supabase_client(user_jwt)

        new_id = str(uuid.uuid4())
        created_at_iso = datetime.now(timezone.utc).isoformat()

        row = {
            "id": new_id,
            "user_id": user_id,
            "text": payload.get("text"),
            "note": payload.get("note"),
            "created_at": created_at_iso,
            "scheduled_at": payload.get("scheduledAt"),
        }

        supabase.table(self.table).insert(row).execute()

        return {
            "id": new_id,
            "text": row["text"],
            "note": row["note"],
            "createdAt": row["created_at"],
            "scheduledAt": row["scheduled_at"],
        }

    def delete_verse(self, user_id: str, user_jwt: str, verse_id: str):
        supabase = get_supabase_client(user_jwt)

        (
            supabase
            .table(self.table)
            .delete()
            .eq("id", verse_id)
            .eq("user_id", user_id)
            .execute()
        )

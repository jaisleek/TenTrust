import hashlib
import secrets
from typing import Any, Dict, Optional

import httpx
from fastapi import HTTPException

from config import settings


def configured() -> bool:
    return bool(settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY and settings.SUPABASE_SERVICE_ROLE_KEY)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def new_token() -> str:
    return secrets.token_urlsafe(32)


class SupabaseStore:
    def __init__(self):
        if not configured():
            raise HTTPException(status_code=503, detail="Screening service is not configured.")
        self.base_url = settings.SUPABASE_URL.rstrip("/")

    def _headers(self, prefer: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
        }
        if prefer:
            headers["Prefer"] = prefer
        return headers

    async def request(self, method: str, path: str, *, params=None, json=None, headers=None):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.request(
                    method,
                    f"{self.base_url}/rest/v1/{path}",
                    params=params,
                    json=json,
                    headers={**self._headers(), **(headers or {})},
                )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail="Screening database is temporarily unavailable.") from exc
        if response.status_code >= 400:
            # Never send database diagnostics or stored sensitive values to callers.
            raise HTTPException(status_code=503, detail="Screening database request failed.")
        if not response.content:
            return None
        try:
            return response.json()
        except ValueError:
            return None

    async def insert(self, table: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        rows = await self.request("POST", table, json=payload, headers={"Prefer": "return=representation"})
        if not rows:
            raise HTTPException(status_code=503, detail="Unable to create screening record.")
        return rows[0]

    async def get_one(self, table: str, params: Dict[str, str]) -> Optional[Dict[str, Any]]:
        rows = await self.request("GET", table, params={**params, "select": "*"})
        return rows[0] if rows else None

    async def patch(self, table: str, params: Dict[str, str], payload: Dict[str, Any]):
        return await self.request("PATCH", table, params=params, json=payload, headers={"Prefer": "return=representation"})

    async def rpc(self, function: str, payload: Dict[str, Any]):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{self.base_url}/rest/v1/rpc/{function}",
                    json=payload,
                    headers=self._headers(),
                )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail="Unable to finalize payment.") from exc
        if response.status_code >= 400:
            raise HTTPException(status_code=409, detail="Payment could not be finalized.")
        return response.json() if response.content else None


async def authenticated_user(authorization: Optional[str]) -> Dict[str, Any]:
    if not configured() or not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Sign in to continue.")
    token = authorization.split(" ", 1)[1].strip()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
                headers={"apikey": settings.SUPABASE_ANON_KEY, "Authorization": f"Bearer {token}"},
            )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="Authentication service is unavailable.") from exc
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Your session is invalid or expired.")
    user = response.json()
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Your session is invalid or expired.")
    return user


async def authenticated_user_id(authorization: Optional[str]) -> str:
    return (await authenticated_user(authorization))["id"]

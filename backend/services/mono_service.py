import logging
from typing import Dict, Any, Optional
import httpx
from fastapi import HTTPException
from config import settings

logger = logging.getLogger(__name__)


class MonoService:
    def __init__(self):
        self.base_url = settings.MONO_BASE_URL.rstrip("/")
        self.secret_key = settings.MONO_SECRET_KEY

    def _get_headers(self) -> Dict[str, str]:
        return {
            "mono-sec-key": self.secret_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def lookup_credit_history(
        self,
        bvn: str,
        provider: str = "all",
        reason: Optional[str] = "Credit Assessment"
    ) -> Dict[str, Any]:
        """
        Retrieves comprehensive credit history from Nigerian credit bureaus (CRC, XDS) via Mono.
        """
        if not self.secret_key:
            raise HTTPException(status_code=500, detail="MONO_SECRET_KEY is not configured.")

        url = f"{self.base_url}/v3/lookup/credit-history/{provider}"
        payload = {
            "bvn": bvn,
            "reason": reason or "Tenant Credit Assessment"
        }

        logger.info(f"Calling Mono credit history lookup for BVN: {bvn[:4]}****{bvn[-3:]} via provider: {provider}")

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    url,
                    json=payload,
                    headers=self._get_headers()
                )

                if response.status_code >= 400:
                    logger.error(f"Mono API returned status {response.status_code} for a credit history request.")
                    error_data = {}
                    try:
                        error_data = response.json()
                    except Exception:
                        error_data = {"message": "Mono returned a non-JSON error response."}
                    raise HTTPException(
                        status_code=response.status_code,
                        detail={
                            "provider": "mono",
                            "message": error_data.get("message", "Mono API error"),
                            "error": error_data
                        }
                    )

                return response.json()

            except httpx.RequestError as exc:
                logger.error(f"Network error calling Mono API: {str(exc)}")
                raise HTTPException(
                    status_code=503,
                    detail=f"Unable to reach Mono service: {str(exc)}"
                )

    async def exchange_auth_code(self, code: str) -> Dict[str, Any]:
        """
        Exchange a short-lived Mono Connect auth code (from widget) for account ID and initial details.
        Endpoint: POST /v2/accounts/auth
        """
        if not self.secret_key:
            raise HTTPException(status_code=500, detail="MONO_SECRET_KEY is not configured.")

        url = f"{self.base_url}/v2/accounts/auth"
        payload = {"code": code}

        logger.info("Exchanging Mono Connect auth code for account ID...")

        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.post(
                    url,
                    json=payload,
                    headers=self._get_headers()
                )

                if response.status_code >= 400:
                    logger.error(f"Mono auth exchange returned status {response.status_code}.")
                    error_data = {}
                    try:
                        error_data = response.json()
                    except Exception:
                        error_data = {"message": "Mono returned a non-JSON error response."}
                    raise HTTPException(
                        status_code=response.status_code,
                        detail={
                            "provider": "mono",
                            "message": error_data.get("message", "Auth code exchange failed"),
                            "error": error_data
                        }
                    )

                return response.json()

            except httpx.RequestError as exc:
                logger.error(f"Network error exchanging Mono auth code: {str(exc)}")
                raise HTTPException(
                    status_code=503,
                    detail=f"Unable to reach Mono service: {str(exc)}"
                )

    async def get_account_identity(self, account_id: str) -> Dict[str, Any]:
        """
        Fetch full identity and banking profile for a linked Mono account.
        Endpoint: GET /v2/accounts/{id}/identity
        """
        if not self.secret_key:
            raise HTTPException(status_code=500, detail="MONO_SECRET_KEY is not configured.")

        url = f"{self.base_url}/v2/accounts/{account_id}/identity"
        logger.info(f"Fetching Mono account identity for account: {account_id}")

        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers())
                if response.status_code >= 400:
                    error_data = {}
                    try:
                        error_data = response.json()
                    except Exception:
                        error_data = {"raw": response.text}
                    raise HTTPException(
                        status_code=response.status_code,
                        detail={"provider": "mono", "message": error_data.get("message", "Error"), "error": error_data}
                    )
                return response.json()
            except httpx.RequestError as exc:
                raise HTTPException(status_code=503, detail=f"Unable to reach Mono service: {str(exc)}")


mono_service = MonoService()


import hashlib
import hmac
import secrets
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from apps.gateway.models import APIKey, User


KEY_PREFIX = "urumi_"


@dataclass(frozen=True)
class AuthenticatedUser:
    user: User
    api_key: APIKey


def generate_api_key() -> tuple[str, str, str]:
    """Return the plaintext key, its lookup prefix, and its SHA-256 hash."""
    secret = secrets.token_urlsafe(32)
    plaintext_key = f"{KEY_PREFIX}{secret}"
    key_prefix = plaintext_key[:14]
    key_hash = hashlib.sha256(plaintext_key.encode("utf-8")).hexdigest()

    return plaintext_key, key_prefix, key_hash


def hash_api_key(plaintext_key: str) -> str:
    """Hash an API key for storage or verification."""
    return hashlib.sha256(plaintext_key.encode("utf-8")).hexdigest()


def authenticate_api_key(
    db: Session,
    plaintext_key: str,
) -> AuthenticatedUser | None:
    """Return the active user and key if the supplied key is valid."""
    if not plaintext_key or not plaintext_key.startswith(KEY_PREFIX):
        return None

    key_prefix = plaintext_key[:14]

    api_key = db.scalar(
        select(APIKey).where(
            APIKey.key_prefix == key_prefix,
            APIKey.revoked_at.is_(None),
        )
    )

    if api_key is None:
        return None

    supplied_hash = hash_api_key(plaintext_key)
    if not hmac.compare_digest(api_key.key_hash, supplied_hash):
        return None

    if api_key.expires_at is not None:
        from datetime import datetime, timezone

        expires_at = api_key.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at <= datetime.now(timezone.utc):
            return None

    user = db.get(User, api_key.user_id)
    if user is None or not user.is_active:
        return None

    return AuthenticatedUser(user=user, api_key=api_key)
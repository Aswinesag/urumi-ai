
from getpass import getpass

from sqlalchemy import select

from apps.gateway.database import SessionLocal
from apps.gateway.models import APIKey, User
from apps.gateway.security import generate_api_key


def main():
    email = input("Existing admin email: ").strip().lower()
    key_name = input("Replacement key name [admin-replacement]: ").strip()
    if not key_name:
        key_name = "admin-replacement"

    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == email))

        if user is None:
            print("User not found. No changes made.")
            return

        if user.role != "admin" or not user.is_active:
            print("User is not an active administrator. No changes made.")
            return

        plaintext_key, key_prefix, key_hash = generate_api_key()

        api_key = APIKey(
            user_id=user.id,
            name=key_name,
            key_prefix=key_prefix,
            key_hash=key_hash,
        )
        db.add(api_key)
        db.commit()
        db.refresh(api_key)

        print("\nReplacement admin key created.")
        print(f"User ID: {user.id}")
        print(f"API key ID: {api_key.id}")
        print("Save this key securely; it will not be shown again:")
        print(plaintext_key)


if __name__ == "__main__":
    main()

import getpass
import sys

from sqlalchemy import select

from apps.gateway.database import SessionLocal
from apps.gateway.models import APIKey, User
from apps.gateway.security import generate_api_key


def main():
    email = input("Admin email: ").strip().lower()
    display_name = input("Admin display name: ").strip()

    if not email or not display_name:
        print("Email and display name are required.")
        sys.exit(1)

    db = SessionLocal()

    try:
        existing = db.scalar(select(User).where(User.email == email))
        if existing:
            print("A user with this email already exists. No changes made.")
            sys.exit(1)

        user = User(
            email=email,
            display_name=display_name,
            role="admin",
            is_active=True,
        )
        db.add(user)
        db.flush()

        plaintext_key, key_prefix, key_hash = generate_api_key()

        api_key = APIKey(
            user_id=user.id,
            name="Initial admin key",
            key_prefix=key_prefix,
            key_hash=key_hash,
        )
        db.add(api_key)
        db.commit()

        print("\nAdmin account created.")
        print(f"User ID: {user.id}")
        print(f"API key ID: {api_key.id}")
        print("\nSAVE THIS API KEY NOW — IT WILL NOT BE SHOWN AGAIN:")
        print(plaintext_key)

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
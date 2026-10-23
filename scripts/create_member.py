
from sqlalchemy import select

from apps.gateway.database import SessionLocal
from apps.gateway.models import APIKey, User
from apps.gateway.security import generate_api_key


def main():
    email = input("Member email: ").strip().lower()
    display_name = input("Member display name: ").strip()

    if not email or not display_name:
        print("Email and display name are required.")
        return

    with SessionLocal() as db:
        existing = db.scalar(select(User).where(User.email == email))
        if existing:
            print("That email already exists. No changes made.")
            return

        user = User(
            email=email,
            display_name=display_name,
            role="member",
            is_active=True,
        )
        db.add(user)
        db.flush()

        plaintext_key, key_prefix, key_hash = generate_api_key()
        api_key = APIKey(
            user_id=user.id,
            name="member-test-key",
            key_prefix=key_prefix,
            key_hash=key_hash,
        )
        db.add(api_key)
        db.commit()

        print("\nMember created.")
        print(f"User ID: {user.id}")
        print(f"API key ID: {api_key.id}")
        print("Save this key securely; it will not be shown again:")
        print(plaintext_key)


if __name__ == "__main__":
    main()
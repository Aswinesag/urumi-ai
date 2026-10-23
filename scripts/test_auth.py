
import getpass

from apps.gateway.database import SessionLocal
from apps.gateway.security import authenticate_api_key


def main():
    api_key = getpass.getpass("Paste your admin API key (input hidden): ")
    db = SessionLocal()

    try:
        result = authenticate_api_key(db, api_key)

        if result is None:
            print("FAIL: API key was rejected.")
            return

        print("PASS: API key authenticated.")
        print(f"User ID: {result.user.id}")
        print(f"Role: {result.user.role}")
        print(f"Key ID: {result.api_key.id}")

        invalid = authenticate_api_key(db, "urumi_invalid_test_key")
        print(f"Invalid key rejected: {invalid is None}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
import os
import sys
import secrets
import subprocess

# Get DATABASE_URL from Kubernetes secret
result = subprocess.run(
    ['kubectl', 'get', 'secret', 'urumi-gateway-db', '-n', 'urumi-gateway', '-o', 'jsonpath={.data.database-url}'],
    capture_output=True,
    text=True
)
if result.returncode == 0:
    import base64
    db_url = base64.b64decode(result.stdout).decode('utf-8')
    os.environ['DATABASE_URL'] = db_url
else:
    print("Failed to get DATABASE_URL from secret")
    sys.exit(1)

# Add the apps directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'apps'))

from gateway.database import SessionLocal
from gateway.models import APIKey, User
from gateway.security import hash_api_key
from sqlalchemy import select

def create_test_api_key():
    """Create a new test API key for the admin user."""
    db = SessionLocal()
    
    try:
        # Get the admin user
        admin = db.execute(select(User).where(User.email == "admin@urumi.local")).scalar_one()
        
        # Generate a new plaintext key
        plaintext_key = f"urumi_{secrets.token_urlsafe(32)}"
        print(f"Generated API key: {plaintext_key}")
        
        # Hash it
        key_hash = hash_api_key(plaintext_key)
        key_prefix = plaintext_key[:10]
        
        # Create and store the API key
        api_key = APIKey(
            user_id=admin.id,
            key_hash=key_hash,
            key_prefix=key_prefix,
        )
        
        db.add(api_key)
        db.commit()
        
        print(f"API key created successfully!")
        print(f"Prefix: {key_prefix}")
        print(f"User: {admin.email} (role: {admin.role})")
        print("\nUse this key in the frontend login:")
        print(plaintext_key)
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_api_key()


import os
from getpass import getpass

import requests

BASE_URL = "http://127.0.0.1:8000"


def main():
    admin_key = getpass("Admin API key (input hidden): ").strip()
    headers = {"Authorization": f"Bearer {admin_key}"}

    # Confirm the admin key is currently valid.
    response = requests.get(
        f"{BASE_URL}/mcp/tools",
        headers=headers,
        timeout=10,
    )
    print("Initial authenticated request:", response.status_code)

    if response.status_code != 200:
        print("Admin authentication failed; stopping test.")
        return

    key_id = input("API key ID to revoke (integer): ").strip()
    if not key_id.isdigit():
        print("Invalid API key ID.")
        return

    # Revoke the selected key.
    response = requests.post(
        f"{BASE_URL}/admin/api-keys/{key_id}/revoke",
        headers=headers,
        timeout=10,
    )
    print("Revocation response:", response.status_code)
    print("Revocation result:", response.text)

    if response.status_code != 200:
        print("Revocation failed; stopping test.")
        return

    # Verify the revoked key is rejected.
    if int(key_id) == int(input("Confirm the revoked key ID: ").strip()):
        if key_id == "1":
            revoked_key = admin_key
        else:
            revoked_key = getpass(
                "Enter the revoked key's secret to verify rejection (hidden): "
            ).strip()

        check = requests.get(
            f"{BASE_URL}/mcp/tools",
            headers={"Authorization": f"Bearer {revoked_key}"},
            timeout=10,
        )
        print("Request using revoked key:", check.status_code)
        print("Expected: 401")
    else:
        print("ID confirmation did not match; skipped revocation check.")


if __name__ == "__main__":
    main()
import io
import os

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": os.environ.get("TEST_ADMIN_EMAIL", "admin@agricam.ai"),
        "password": os.environ.get("TEST_ADMIN_PASSWORD", "Admin@2026"),
    }, timeout=30)
    assert r.status_code == 200, r.text[:300]
    return r.json().get("access_token") or r.json().get("token")


def test_upload_csv_no_objectid_500(token):
    """Regression: insert_one used to mutate dict with ObjectId -> 500 on serialize."""
    csv_content = "date,humidity,temperature,yield\n2024-01-01,65,22,7.5\n2024-01-02,68,24,7.8"
    r = requests.post(
        f"{BASE_URL}/api/analysis/upload-csv",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("TEST_data.csv", io.BytesIO(csv_content.encode()), "text/csv")},
        timeout=60,
    )
    assert r.status_code == 200, f"{r.status_code}: {r.text[:400]}"
    d = r.json()
    assert "_id" not in d
    assert "results" in d

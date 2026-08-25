# AGRICAM IA — Test Credentials

## Admin Account
- Email: `admin@agricam.ai`
- Password: `Admin@2026`
- Role: Admin (full access)

## Farmer Account
- Email: `agriculteur@agricam.ai`
- Password: `Farmer@2026`
- Role: Farmer

## Test env vars (backend/tests/.env.test, gitignored)
- TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD / TEST_FARMER_EMAIL / TEST_FARMER_PASSWORD
- All test files read credentials via `os.environ.get("TEST_*", fallback)`; conftest.py loads .env.test + backend/.env + frontend/.env

## Demo Phone Numbers (NetWalletPay Sandbox)
- MTN MoMo: `677123456` (Cameroon format: 6XXXXXXXX)
- Orange Money: `699876543`
- Invalid (for testing validation): `12345`

## VitaBif Gateway (Élevage)
- Generate per-farm key: `POST /api/elevage/farms/{farm_id}/gateway` (admin token)
- Ingest header: `X-Gateway-Key: <key>`

## Notes
- Backend URL in `/app/frontend/.env` as `REACT_APP_BACKEND_URL`
- DB seeded with 577 demo users, 873 parcels, 1753 sensors + Élevage: 4 farms/~519 animals for admin
- NetWalletPay sandbox sometimes returns "A general error occurred" — upstream behavior.

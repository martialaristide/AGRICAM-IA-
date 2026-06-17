# AGRICAM IA — Test Credentials

## Admin Account
- Email: `admin@agricam.ai`
- Password: `Admin@2026`
- Role: Admin (full access)

## Demo Phone Numbers (NetWalletPay Sandbox)
- MTN MoMo: `677123456` (Cameroon format: 6XXXXXXXX)
- Orange Money: `699876543`
- Invalid (for testing validation): `12345`

## Notes
- Backend URL is in `/app/frontend/.env` as `REACT_APP_BACKEND_URL`
- DB seeded with 577 demo users, 873 parcels, 1753 sensors
- NetWalletPay sandbox sometimes returns "A general error occurred" — this is upstream behavior, the frontend surfaces it correctly via toast.

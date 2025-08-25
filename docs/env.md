# Environment Variables

## Location
- `.env.local` in project root.

## Common Variables
- `NEXT_PUBLIC_API_BASE`: Backend API base URL
- `NEXT_PUBLIC_SITE_URL`: Public site URL
- Add other secrets as needed (never commit `.env.local` to public repo)

## Usage
- Access via `process.env.NEXT_PUBLIC_API_BASE` in frontend code.

---
See also: `README.md` and `docs/api.md`.

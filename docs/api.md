# API Usage & Integration

This document describes how the frontend interacts with the backend API.

## API Base
- `https://api.manhwagalaxy.org/manhwa`

## Endpoints
- Manga details: `/manhwa/{name}`
- Chapters list: `/manhwa/{name}/chapters`
- Chapter images: `/manhwa/{name}/chapters/{chapter_number}`
- Category list: `/manhwa/category/{slug}`
- Search: `/manhwa/search?q={query}`

## Fetching Logic
- Multiple name variants are tried for resilience.
- Chapters and details are fetched in parallel.
- Caching is used for chapter images and lists.

## Error Handling
- Network errors and 404s are handled with user-friendly messages.

## Security
- No sensitive data is exposed in frontend requests.

---
See also: `docs/pages.md` and `README.md`.

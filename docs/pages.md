# Page Structure & Routing

This document describes the main pages, dynamic routes, and navigation logic for the Manhua-Frontend project.

## Main Pages
- `/` (Home): Manga list, featured, pagination.
- `/bookmark`: User bookmarks (requires authentication).
- `/category/[slug]`: Manga by category. `slug` is a string.
- `/details/[name]`: Manga details. `name` is a string (hyphenated).
- `/details/[name]/loading`: Loading skeleton for details page.
- `/details/[name]/chapters/[chapter_number]`: Manga chapter. `chapter_number` is an integer.
- `/search`: Search results (query params).

## Dynamic Parameters
- `slug`: Category identifier (string)
- `name`: Manga identifier (string, hyphenated)
- `chapter_number`: Chapter index (integer)

## Navigation
- All navigation uses hyphenated URLs for SEO.
- Display names are formatted with capital letters and spaces for readability.
- Pagination and chapter navigation use client-side state and URL params.

## Error Handling
- 404 or error message shown for invalid/missing data.
- Bookmark page prompts login if user is not authenticated.

## SEO
- All pages set appropriate `<title>` and meta description for Google indexing.

---
For more details, see `README.md` and `docs/seo.md`.

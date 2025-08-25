# SEO, Sitemap, and robots.txt

## Sitemap
- Located in `/public/sitemap.xml` (or `/public/sitemap-index.xml` for multi-sitemap).
- URLs must be XML-escaped:
  - `&` → `&amp;`
  - `<` → `&lt;`
  - `>` → `&gt;`
  - `"` → `&quot;`
  - `'` → `&apos;`
- Example:
  `<loc>https://manhwagalaxy.org/details/one-piece/chapters/5?ref=search&amp;sort=asc</loc>`
- Always wrap URLs in `<loc>...</loc>` tags.

## robots.txt
- Located in `/public/robots.txt`.
- Example:
  ```
  User-agent: *
  Allow: /
  Sitemap: https://yourdomain.com/sitemap.xml
  ```
- Update `Sitemap` URL to match your domain.

## Meta Tags
- All pages set `<title>` and meta description for Google indexing.

---
See also: `README.md` and `docs/pages.md`.

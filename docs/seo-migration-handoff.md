# SEO migration handoff — Website Manager

Source-only. This commit does **not** change WordPress, Cloudflare, DNS, Vercel project settings, credentials, tracking, Ads, or the live site.

**Go-live: NOT READY.** Legacy media (233 assets) is an unresolved blocker.

## Git

- Repository: `https://github.com/Krishna2918/BIT_WEBSITE`
- Branch: `main`
- SHA: see latest commit on `main`

## What is in source

1. Nine valuable URLs remain **200**.
2. Authoritative live **301**s (service pages, six article slugs → `/insights/*`, `/blog` → `/insights`, `/contact` → `/consult`, WP sitemaps → `/sitemap.xml`, `/category/it` + `/author/admin` → `/insights`).
3. Approved **410**s including Elementor/WPR/Metform/sample/404-2/hero-section, plus known query variants only.
4. Production `robots.txt` merges Cloudflare Content-Signal + bot blocks, then `/api/`, `/thank-you`, `/consult-continue`.
5. Preview stays `Disallow: /` + page `noindex`. Measurement off.
6. Canonical sitemap is `https://bitsolution.ca/sitemap.xml` only.

## Unresolved blocker — media

The audit requires **233** legacy `/wp-content/uploads/` assets. This repo has **0** (`.gitkeep` only). They were **not** fetched from live WordPress. Website Manager must copy the approved media pack into `public/wp-content/uploads/` before cutover.

## Other gaps

- Legal-reviewed AODA/WCAG statement still not available.
- Terms remain 410.
- Support ticket URL still pending; old help-centre is 410.
- Ask AI backend not authorized.

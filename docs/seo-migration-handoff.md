# SEO migration handoff — Website Manager

Source-only. This commit does **not** change WordPress, Cloudflare, DNS, Vercel project settings, credentials, tracking, Ads, or the live site.

## Git

- Repository: `https://github.com/Krishna2918/BIT_WEBSITE`
- Branch: `main`
- SHA: fill after push

## What to verify

1. Nine valuable URLs return **200** (trailing slash **301**s to the no-slash canonical):
   - `/about-us`
   - `/accessibility-statement`
   - `/solutions`
   - `/cloud-services-brampton`
   - `/how-to-choose-a-managed-it-services-provider`
   - `/cyber-security-tips-for-small-businesses`
   - `/5-biggest-benefits-of-cloud-backups`
   - `/10-signs-your-business-needs-managed-it-support`
   - `/top-7-cyber-security-solutions-every-business-needs-in-2025`
2. Sample **301** one-hop: `/about` → `/about-us`, `/services` → `/solutions`, `/contact-us` → `/consult`
3. Sample **410**: `/help-centre`, `/careers`, `/case-studies`, `/author/admin`
4. `robots.txt` on **bitsolution.ca**: `Content-Signal: search=yes, ai-train=no, use=reference` plus Disallow `/api/`, `/thank-you`, `/login`, `/__grok/`
5. Preview / `*.vercel.app`: `Disallow: /` and page `noindex, nofollow`. Measurement stays off.
6. `sitemap.xml` lists only `https://bitsolution.ca/…` indexable URLs.
7. Homepage has a real text **H1**. No `fonts.googleapis.com`.
8. Legacy media: copy original `/wp-content/uploads/` files into `public/wp-content/uploads/` so those URLs keep working. Not fetched in this commit.

## Counts (source plan)

| Class | Count | Where |
| --- | --- | --- |
| Keep 200 | 9 | `KEEP_200` |
| One-hop 301 | 39 aliases | `REDIRECTS_301` + `vercel.json` |
| 410 exact | 27 | `GONE_410` (middleware) |
| 410 prefixes | 4 | `/author/`, `/tag/`, `/category/`, `/wp-json` |
| Indexable sitemap URLs | see `indexablePaths()` | `public/sitemap.xml` |

## Unresolved gaps

- Legal-reviewed **AODA / WCAG** statement: not invented. `/accessibility-statement` is a contact path until legal delivers copy.
- Legal-reviewed **Terms**: retired as **410**. Do not 301 to a stub.
- **Support ticket URL**: still pending COO. Old help-centre is **410**, not reused.
- **Ask AI** backend: not authorized. Button remains UI-only.
- **Legacy WordPress media files**: folder reserved; files not copied (live site was not accessed).
- Full historical WP crawl (pagination, `?p=`, attachment pages) may add more 301/410 rows. Append to `src/data/legacy-migration.ts` — keep one hop.

## Do not enable on cutover until

Cookie consent, privacy/security approval, QA, then GTM/GA4 IDs. Clarity and CallRail stay off at launch.

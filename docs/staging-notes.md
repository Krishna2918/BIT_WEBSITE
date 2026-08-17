# Staging — conversion pass (15 Aug 2026)

## Rollback
Backup: `/workspace/backups/2026-08-15-pre-conversion/`
Restore: copy `src/` and `public/` from that folder over the project, restart the preview.

## What shipped in staging (not production)

- Repositioning line on home + footer
- Global phone `+1 905-867-6574` and Book consultation
- Isolated LPs: `/fleet-operations/ontario`, `/dental-it/ontario`
- `/consult`, `/thank-you`, `/privacy`
- CASL checkbox, honeypot, min-fill timer, UTM/GCLID hidden fields
- Downloads: `/downloads/mto-fleet-checklist.pdf`, `/downloads/dental-phipa-self-audit.pdf`
- Hooks: GTM, GA4, Clarity, CallRail (inactive until IDs). `dataLayer` events: `consult_submit`, `checklist_download`, `click_to_call`, `book_consult_click`
- Phone links use `callrail rTapNumber` for DNI
- sitemap.xml + robots.txt + LocalBusiness JSON-LD
- No new testimonials, stats, or certifications

## QA (this environment)

| Check | Result |
| --- | --- |
| Home, consult, privacy, both LPs render | Pass, no console errors |
| Phone 390 — no horizontal overflow | Pass |
| `tel:+19058676574` present | Pass |
| Invalid consult API | 400 |
| Valid consult API | 200 `{ok:true}` |
| Fleet form + CASL + `?gclid=TESTGCLID` | Redirect `/thank-you?intent=fleet`, gclid stored |
| Both PDFs | 200, `application/pdf`, `%PDF-` |
| Honeypot field off-screen | Pass |

Not run: live GTM/GA4/Clarity/CallRail (no account IDs yet). Webhook email (no `CONSULT_WEBHOOK_URL` yet).

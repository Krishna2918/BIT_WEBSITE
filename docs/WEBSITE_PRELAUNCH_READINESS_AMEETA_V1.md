# Canadian Website pre-launch readiness — Ameeta-led intake

Status: local/staging only. No deployment, DNS, provider, tag, form, CRM, campaign, or spend activation is authorized by this file.

Reserved target window: 18 August 2026 at 10:30 AM America/Toronto. This is planning data only; it is not a cutover authorization.

## Production route, canonical, redirect, robots, and sitemap plan

- Production origin is `https://bitsolution.ca`; `https://www.bitsolution.ca` must 301 to the chosen canonical host (or the inverse, if the owner changes the canonical-host decision before cutover). Never serve both as independent 200 pages.
- Preview and staging builds remain `noindex,nofollow,noarchive`; production becomes indexable only when `VITE_SITE_INDEXABLE=1` is deliberately bound in the approved production release.
- Each indexable route must emit one self-referencing canonical on `https://bitsolution.ca`, with one URL style and no query-string canonical.
- Keep `/login`, `/thank-you`, `/consult/continue`, `/api/*`, and authentication routes out of the sitemap and `noindex`.
- The production sitemap must include only 200, canonical, indexable public routes. Dynamic Industry and Insight entries must be generated from their approved source arrays rather than hand-maintained.
- Before cutover, export the complete WordPress URL inventory from the CMS and Search Console. Every legacy URL must be classified as: unchanged 200, one-hop 301 to the closest equivalent, or intentional 410. No blanket redirect to `/`.
- Known legacy candidates requiring explicit mapping in that inventory include `/contact/`, `/about-us/`, `/solutions/`, and `/why-businesses-need-reliable-cloud-backup-services-in-canada/`. Proposed targets must be content-equivalent and owner-approved before rules are installed.
- Preserve query parameters used for advertising attribution on landing-page loads, but never place them in canonicals.
- After cutover, verify HTTP status, final URL, canonical, robots, sitemap membership, title, description, structured data, and internal links for every production route.

Current dedicated consultation routes:

- `/consult`
- `/fleet-operations/ontario`
- `/dental-it/ontario`
- `/thank-you` (`noindex`)
- `/consult/continue` (`noindex`, opaque server-minted token only, currently fail-closed)

## Consent and measurement hooks

- Optional analytics defaults to denied and loads only when `VITE_MEASUREMENT_ON=1`, an exact GTM or GA4 ID is present, and the visitor grants analytics consent.
- GTM/GA4/Clarity/CallRail remain off in preview and staging. Form values, chat text, phone numbers, email addresses, website-review URLs, tokens, and free text must never enter measurement payloads.
- Service-inquiry, service-callback, service-update, website-review, and optional marketing permissions remain separate. Optional permissions default unchecked.
- The website-review URL is accepted only with its explicit opt-in; it authorizes a human high-level public-page review only, never crawling or security scanning.

Approved retention schedule:

- failed or unsubmitted intake: 30 days;
- service-inquiry and CRM records: 24 months after last activity;
- consent and suppression evidence: active period plus 24 months after withdrawal;
- send and audit metadata: 24 months;
- raw analytics identifiers: 14 months;
- call recordings: off;
- legal hold: overrides scheduled deletion.

The privacy/CMP implementation must encode these periods, keep service contact separate from unchecked optional marketing consent, and keep Consent Mode default-denied.

## Fail-closed intake and continuation

- Without approved server-only bridge URL/token bindings, `/api/consult` returns `delivery_not_configured`; no thank-you success state is shown.
- A continuation URL contains only an opaque server-minted token. Missing or malformed tokens show an unavailable state and never create, update, or send a lead.
- Provider workers remain off. No email, WhatsApp, Teams, callback, or CRM delivery is attempted from the browser.
- The Website must adopt only a freshly sealed CRM v2 contract. The current contract bytes do not match the prior handoff hash and are therefore not approved for binding.

## Accessibility, mobile, and performance acceptance

- Desktop: 1440×900. Mobile: 390×844.
- One `h1`; labelled controls; fieldset/legend for grouped choices; keyboard operability; visible focus; errors connected with `aria-describedby`; error summary receives focus.
- No horizontal overflow at either viewport. Inputs and primary actions remain readable and touchable without zoom.
- Cookie choices are keyboard accessible and optional analytics is off by default.
- Zero console errors. No unexpected third-party measurement request.
- Performance gate: preserve the globe quality, lazy-load non-critical 3D/video work, and record LCP/CLS/INP on the immutable candidate. The current development build warns that the globe client chunk is about 967 kB before gzip (about 268 kB gzip), so production performance remains a measured acceptance gate rather than an assumed pass.

## Rollback

1. Preserve the immutable pre-cutover deployment ID, environment manifest, DNS records, redirect map, robots file, and sitemap hash.
2. On a failed canary, restore the previous deployment alias and prior DNS target; do not rotate backend tokens or modify CRM/Chatwoot as a Website rollback.
3. Restore the previous redirect, robots, sitemap, CSP, and environment manifests together.
4. Confirm `bitsolution.ca` and `www` return the previous site, Call/WhatsApp remain `+1 905-867-6574`, forms are unavailable rather than lossy, and tracking remains off.

## Post-cutover canary checklist

1. Logged-out desktop and mobile: home, consultation, Fleet, Dental, Privacy, Support, one Industry, and one Insight route render with no console error or horizontal overflow.
2. `bitsolution.ca`/`www` host policy, HTTPS, redirects, canonicals, robots, sitemap, and structured data match the approved manifest.
3. One synthetic General, Fleet, and Dental form validates locally; production sends are not attempted until the separate CRM bridge activation gate.
4. With that later gate, run one approved synthetic form per route and verify one CRM record, one idempotency result, Ameeta queue ownership, no duplicate department copy, no PII in analytics/logs, and no provider send unless separately approved.
5. Consent denied: no non-essential tag request. Consent granted after ID approval: only the approved event vocabulary is emitted, with no form values.
6. Call and WhatsApp still point to `+1 905-867-6574`; support-ticket CTA stays unavailable until the COO supplies the new ticket URL.
7. Chat launcher remains unchanged unless its separate hostname/Chatwoot gate is approved.

## Current integrity hold

The supplied CRM v2 handoff declared 7,539 bytes and SHA-256 `D2957CE31FAA0F53ACD377A2176EDF7C85690EAA39D50A3E1A0C6B2445CE47D1`. The current valid JSON file reads 8,811 bytes and SHA-256 `C87F3573DAC801A594492F682B647E75E2C72DDF652C2F662274ADB46BDAC30D`. It also still names `SALES/MARKETING` and an HR/Access hold, while the latest owner decision names the existing BIT Helpdesk Teams group and says Ameeta access is ready subject to read-only identity/role and group-membership verification. Automation/COO must re-seal and re-deliver the authoritative contract before Website-to-CRM binding or canary preparation can proceed.

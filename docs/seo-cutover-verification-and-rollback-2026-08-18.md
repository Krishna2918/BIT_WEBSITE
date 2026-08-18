# BIT Solution SEO cutover verification and rollback

Status: LOCAL/PREVIEW CANDIDATE ONLY. No production, DNS, domain, Search Console, form/provider, measurement, Ads, or spend action is authorized by this document.

## Before cutover

- Bind the sealed Cloudflare/WordPress rollback snapshot with SHA-256 `3507AE8FA1BEB5D48D0ADF814490C7404474E77D67B1B2C8E85C9DAD9D095C64`.
- Verify the release commit, tree, archive, and manifest match the locally tested identities.
- Verify the 42-row map: 10 direct 200, 21 direct 301, 11 real 410/noindex.
- Verify all 13 internal aliases and all 9 WordPress sitemap compatibility paths.
- Verify all 233 `/wp-content/uploads` resources exist byte-for-byte in deployment output.
- Keep preview `X-Robots-Tag: noindex, nofollow, noarchive` and meta robots noindex.
- Obtain Website, Marketing, Security, Privacy, CRM, and fresh owner go/no-go approvals.

## Host normalization at the cutover gate

Use one scoped Cloudflare edge rule for apex/www only so all three source forms preserve path and query and reach the HTTPS apex in one response:

- `http://bitsolution.ca/:path*` → `https://bitsolution.ca/:path*`
- `http://www.bitsolution.ca/:path*` → `https://bitsolution.ca/:path*`
- `https://www.bitsolution.ca/:path*` → `https://bitsolution.ca/:path*`

The rule must not match `crm-api`, `chat`, `livechat`, mail, or any other subdomain. Confirm the response is one 301 with the original path and query. The source `www` host redirect in `vercel.json` is a fallback; do not accept a Cloudflare→Vercel redirect chain.

## Exact post-cutover crawl

1. Fetch every source and destination in `docs/seo-migration-route-map-2026-08-18.json` without following redirects, then follow once.
2. Assert 10 preserve rows return 200 directly, 21 redirect rows return one 301 and then 200, and 11 retired rows return 410 with `X-Robots-Tag: noindex, nofollow, noarchive`.
3. Assert all 13 aliases and 9 `/wp-sitemap*` compatibility URLs return one 301 to their exact destination.
4. Fetch `/sitemap.xml` directly: 200 XML, only `https://bitsolution.ca` URLs, no redirected/410/private URLs, no duplicates.
5. Fetch `robots.txt`: exact Content-Signal, named bot blocks, WordPress admin rules, private-route rules, and canonical sitemap line.
6. Compare title, description, meaningful text H1, canonical, structured-data types, internal links, status, and indexability against the captured WordPress baseline and migration contract.
7. Verify all 233 inventory resources return 200 with the recorded byte length and SHA-256.
8. Verify no redirect chain/loop, mixed host, duplicate canonical, accidental noindex, blocked required asset, 404, or soft 404.
9. Verify Fleet and Dental routes, consent defaults, consultation fail-closed behavior, desktop/mobile layout, and zero unapproved Google Fonts/Grok/measurement requests.

## Immediate rollback triggers

Restore the prior WordPress/DNS origin using the sealed rollback snapshot if any of these occurs:

- any mapped preserve page is not direct 200;
- any required redirect takes more than one hop, loses path/query, loops, or lands on the wrong equivalent;
- any retired URL returns a homepage-style 200/soft 404 instead of 410/noindex;
- sitemap, robots Content-Signal, canonical, H1, structured data, or production indexability is materially wrong;
- any inventoried legacy media resource is missing or hash/length mismatched;
- unexpected 404/5xx, blocked assets, mixed hosts, form/consent regression, or protected subdomain drift;
- CRM, Security, Privacy, or owner acceptance is withdrawn.

Rollback changes only the Website apex/www route to the exact prior WordPress values. It must not change `crm-api`, `chat`, `livechat`, MX, nameservers, mail, providers, measurement, or Ads. After rollback, repeat the production baseline readback and confirm apex/www title/status plus the protected subdomains.

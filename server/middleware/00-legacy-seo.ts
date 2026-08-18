/**
 * One-hop 301 + 410 + preview robots. Production robots/sitemap also live
 * in /public for static fallback after cutover.
 */
import { resolveLegacy } from "../../src/lib/legacy-http";
import { robotsTxt, sitemapXml } from "../../src/lib/seo";

type Ev = {
  url: URL;
  req: { method: string; headers: Headers };
};

function previewHost(event: Ev): boolean {
  const host = (
    event.req.headers.get("x-forwarded-host") ??
    event.req.headers.get("host") ??
    event.url.host
  )
    .split(":")[0]
    .toLowerCase();
  return host !== "bitsolution.ca" && host !== "www.bitsolution.ca";
}

export default function legacySeoMiddleware(event: Ev, next: () => unknown) {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return next();

  const path = event.url.pathname;
  const loc = path + event.url.search;
  if (path === "/robots.txt") {
    return new Response(robotsTxt(previewHost(event)), {
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-cache" },
    });
  }
  if (path === "/sitemap.xml") {
    return new Response(sitemapXml(), {
      headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "no-cache" },
    });
  }

  const result = resolveLegacy(loc);
  if (result.status === 410) {
    return new Response("Gone", {
      status: 410,
      headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" },
    });
  }
  if (result.status === 301) {
    return new Response(null, {
      status: 301,
      headers: { location: result.to },
    });
  }
  return next();
}

/** Vite/Nitro helper: 301, 410, preview robots, canonical sitemap. */

export function applyLegacyToNodeResponse(req, res, resolve, robots, sitemap) {
  const rawUrl = req.url ?? "/";
  const path = rawUrl.split("?")[0] || "/";
  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "")
    .split(":")[0]
    .toLowerCase();
  const preview = host !== "bitsolution.ca" && host !== "www.bitsolution.ca";

  if (path === "/robots.txt") {
    res.statusCode = 200;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end(robots(preview));
    return true;
  }
  if (path === "/sitemap.xml") {
    res.statusCode = 200;
    res.setHeader("content-type", "application/xml; charset=utf-8");
    res.end(sitemap());
    return true;
  }
  const result = resolve(path);
  if (result.status === 410) {
    res.statusCode = 410;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.setHeader("x-robots-tag", "noindex");
    res.end("Gone");
    return true;
  }
  if (result.status === 301) {
    res.statusCode = 301;
    res.setHeader("location", result.to);
    res.end();
    return true;
  }
  return false;
}

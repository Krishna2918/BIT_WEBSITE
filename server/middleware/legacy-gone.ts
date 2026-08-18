type GoneEvent = {
  url: URL;
  res: { status: number; statusText: string; headers: Headers };
};

const GONE_PATHS = new Set([
  "/sample-page",
  "/404-2",
  "/hero-section",
  "/elementskit-content/dynamic-content-megamenu-menuitem488",
  "/metform-form/ad-form",
  "/metform-form/contact-form",
  "/metform-form/servies",
]);

const GONE_HOME_QUERY_KEYS = new Set(["elementskit_template", "wpr_templates"]);

export default function legacyGone(event: GoneEvent) {
  const pathname = event.url.pathname.replace(/\/+$/, "") || "/";
  const hasRetiredHomeQuery =
    pathname === "/" &&
    [...event.url.searchParams.keys()].some((key) => GONE_HOME_QUERY_KEYS.has(key));

  if (!GONE_PATHS.has(pathname) && !hasRetiredHomeQuery) return undefined;

  event.res.status = 410;
  event.res.statusText = "Gone";
  event.res.headers.set("Content-Type", "text/html; charset=utf-8");
  event.res.headers.set("Cache-Control", "public, max-age=300");
  event.res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex,nofollow,noarchive\"><title>Content removed — BIT Solution</title></head><body><main><h1>Content removed</h1><p>This retired template or sample is no longer available.</p></main></body></html>";
}

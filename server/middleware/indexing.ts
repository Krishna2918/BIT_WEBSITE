type HeaderEvent = { res: { headers: Headers } };

export const CONTENT_SECURITY_POLICY =
  "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://livechat.bitsolution.ca https://www.googletagmanager.com https://www.googleadservices.com https://www.google.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob: https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google.com https://pagead2.googlesyndication.com https://www.googleadservices.com https://google.com; media-src 'self' blob:; connect-src 'self' https://challenges.cloudflare.com https://livechat.bitsolution.ca wss://livechat.bitsolution.ca https://www.googletagmanager.com https://pagead2.googlesyndication.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://ad.doubleclick.net https://www.google.com https://google.com; frame-src https://challenges.cloudflare.com https://livechat.bitsolution.ca; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests";

export default function indexingHeaders(event: HeaderEvent) {
  event.res.headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  event.res.headers.set(
    "X-Robots-Tag",
    process.env.VITE_SITE_INDEXABLE === "1"
      ? "index, follow"
      : "noindex, nofollow, noarchive",
  );
}

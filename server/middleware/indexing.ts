type HeaderEvent = { url: URL; res: { headers: Headers } };

const INDEXABLE_HOSTS = new Set(["bitsolution.ca", "www.bitsolution.ca"]);

export default function indexingHeaders(event: HeaderEvent) {
  event.res.headers.set(
    "X-Robots-Tag",
    process.env.VITE_SITE_INDEXABLE === "1" &&
      INDEXABLE_HOSTS.has(event.url.hostname.toLowerCase().replace(/\.$/, ""))
      ? "index, follow"
      : "noindex, nofollow, noarchive",
  );
}

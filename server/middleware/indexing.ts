type HeaderEvent = { res: { headers: Headers } };

export default function indexingHeaders(event: HeaderEvent) {
  event.res.headers.set(
    "X-Robots-Tag",
    process.env.VITE_SITE_INDEXABLE === "1"
      ? "index, follow"
      : "noindex, nofollow, noarchive",
  );
}

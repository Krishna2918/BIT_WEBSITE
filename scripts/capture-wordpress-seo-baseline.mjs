import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const ORIGIN = "https://bitsolution.ca";
const ROOT = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, "$1"));
const OUTPUT = join(ROOT, "docs", "wordpress-seo-baseline-2026-08-18.json");
const MEDIA_OUTPUT = join(ROOT, "docs", "seo-legacy-media-inventory-2026-08-18.json");

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex").toUpperCase();
const decode = (value) => value.replace(/&amp;/g, "&").replace(/&#038;/g, "&");
const normalizePath = (value) => {
  const url = new URL(decode(value), ORIGIN);
  return url.origin === ORIGIN ? `${url.pathname}${url.search}` : null;
};

async function fetchBytes(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(12_000),
    headers: { "User-Agent": "BIT-Website-SEO-Migration-Baseline/1.0", ...(options.headers || {}) },
  });
  return { response, bytes: Buffer.from(await response.arrayBuffer()) };
}

function xmlLocations(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decode(match[1]));
}

function extractHtml(html, name) {
  const pattern = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "i");
  return html.match(pattern)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || null;
}

function extractAttr(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"))?.[1] || null;
}

function pageSignals(html) {
  const canonicalTag = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0] ||
    html.match(/<link\b[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/i)?.[0];
  const descriptionTag = html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] ||
    html.match(/<meta\b[^>]*content=["'][^"']*["'][^>]*name=["']description["'][^>]*>/i)?.[0];
  const robotsTag = html.match(/<meta\b[^>]*name=["']robots["'][^>]*>/i)?.[0] || null;
  const schemaTypes = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map((match) => match[1]);
  return {
    title: extractHtml(html, "title"),
    description: descriptionTag ? extractAttr(descriptionTag, "content") : null,
    h1: extractHtml(html, "h1"),
    canonical: canonicalTag ? extractAttr(canonicalTag, "href") : null,
    robots: robotsTag ? extractAttr(robotsTag, "content") : null,
    schema_types: [...new Set(schemaTypes)],
  };
}

function collectUploadUrls(html) {
  const urls = new Set();
  for (const match of html.matchAll(/(?:src|href)=["']([^"']*\/wp-content\/uploads\/[^"'#?]+(?:\?[^"'#]*)?)["']/gi)) {
    const path = normalizePath(match[1]);
    if (path) urls.add(path);
  }
  for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(",")) {
      const path = normalizePath(candidate.trim().split(/\s+/, 1)[0]);
      if (path?.includes("/wp-content/uploads/")) urls.add(path);
    }
  }
  return urls;
}

const sitemapIndex = await fetchBytes(`${ORIGIN}/wp-sitemap.xml`);
const sitemapIndexText = sitemapIndex.bytes.toString("utf8");
const childSitemaps = xmlLocations(sitemapIndexText);
const sitemapUrls = new Set();
const sitemapDocuments = [];

for (const child of childSitemaps) {
  const fetched = await fetchBytes(child);
  const text = fetched.bytes.toString("utf8");
  const urls = xmlLocations(text);
  urls.forEach((url) => sitemapUrls.add(url));
  sitemapDocuments.push({
    url: child,
    status: fetched.response.status,
    bytes: fetched.bytes.length,
    sha256: sha256(fetched.bytes),
    url_count: urls.length,
  });
}

const mediaPaths = new Set();
const pages = await Promise.all([...sitemapUrls].sort().map(async (url) => {
  const fetched = await fetchBytes(url);
  const html = fetched.bytes.toString("utf8");
  collectUploadUrls(html).forEach((path) => mediaPaths.add(path));
  return {
    url,
    path: `${new URL(url).pathname}${new URL(url).search}`,
    status: fetched.response.status,
    final_url: fetched.response.url,
    bytes: fetched.bytes.length,
    sha256: sha256(fetched.bytes),
    ...pageSignals(html),
  };
}));

const media = await Promise.all([...mediaPaths].sort().map(async (path) => {
  const fetched = await fetchBytes(`${ORIGIN}${path}`);
  return {
    path,
    status: fetched.response.status,
    content_type: fetched.response.headers.get("content-type"),
    bytes: fetched.bytes.length,
    sha256: sha256(fetched.bytes),
  };
}));

const robots = await fetchBytes(`${ORIGIN}/robots.txt`);
const baseline = {
  schema: "bit.website.wordpress-seo-baseline:v1",
  captured_at: new Date().toISOString(),
  origin: ORIGIN,
  sitemap_index: {
    url: `${ORIGIN}/wp-sitemap.xml`,
    status: sitemapIndex.response.status,
    bytes: sitemapIndex.bytes.length,
    sha256: sha256(sitemapIndex.bytes),
    child_count: childSitemaps.length,
  },
  sitemap_documents: sitemapDocuments,
  sitemap_url_count: pages.length,
  pages,
  robots: {
    url: `${ORIGIN}/robots.txt`,
    status: robots.response.status,
    bytes: robots.bytes.length,
    sha256: sha256(robots.bytes),
    body: robots.bytes.toString("utf8"),
  },
};
const inventory = {
  schema: "bit.website.legacy-media-inventory:v1",
  captured_at: baseline.captured_at,
  source_origin: ORIGIN,
  source_page_count: pages.length,
  media_count: media.length,
  media,
};

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(baseline, null, 2)}\n`);
await writeFile(MEDIA_OUTPUT, `${JSON.stringify(inventory, null, 2)}\n`);
console.log(JSON.stringify({
  status: "PASS",
  sitemapUrls: pages.length,
  childSitemaps: childSitemaps.length,
  media: media.length,
  output: OUTPUT,
  mediaOutput: MEDIA_OUTPUT,
}));

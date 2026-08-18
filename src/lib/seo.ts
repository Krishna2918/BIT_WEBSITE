import { SITE } from "@/lib/site";

export function canonicalLink(path: string) {
  const normalized = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  return { rel: "canonical", href: `${SITE.url}${normalized}` } as const;
}

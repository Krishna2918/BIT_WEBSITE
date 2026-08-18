import {
  GONE_410,
  GONE_PREFIXES,
  KEEP_200,
  REDIRECTS_301,
  normalizePath,
} from "@/data/legacy-migration";

export type LegacyResult =
  | { status: 200 }
  | { status: 301; to: string }
  | { status: 410 };

const GONE = new Set<string>(GONE_410);

export function resolveLegacy(pathname: string): LegacyResult {
  const raw = (pathname.split("?")[0] ?? "/") || "/";
  const path = normalizePath(raw);

  if (GONE.has(path)) return { status: 410 };
  for (const prefix of GONE_PREFIXES) {
    if (path === prefix.slice(0, -1) || path.startsWith(prefix) || raw.startsWith(prefix)) {
      return { status: 410 };
    }
  }

  const dest = REDIRECTS_301[path];
  if (dest) return { status: 301, to: dest };

  if (raw !== path && raw !== "/") {
    return { status: 301, to: path };
  }

  return { status: 200 };
}

export function assertOneHop(): string[] {
  const errors: string[] = [];
  const froms = new Set(Object.keys(REDIRECTS_301));
  for (const [from, to] of Object.entries(REDIRECTS_301)) {
    if (from === to) errors.push(`${from} redirects to itself`);
    if (froms.has(to)) errors.push(`${from} → ${to} is a two-hop (to is also a from)`);
    if (GONE.has(to)) errors.push(`${from} → ${to} lands on a 410`);
    if (KEEP_200.includes(from as (typeof KEEP_200)[number])) {
      errors.push(`${from} is KEEP_200 and also a redirect`);
    }
  }
  for (const keep of KEEP_200) {
    if (GONE.has(keep)) errors.push(`${keep} is both 200 and 410`);
  }
  return errors;
}

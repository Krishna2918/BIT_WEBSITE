import plan from "./legacy-migration.json";

export const CANONICAL_ORIGIN = "https://bitsolution.ca";

export const KEEP_200 = plan.keep200 as readonly string[];
export const REDIRECTS_301 = plan.redirects301 as Record<string, string>;
export const GONE_410 = plan.gone410 as readonly string[];
export const GONE_PREFIXES = plan.gonePrefixes as readonly string[];

export function normalizePath(pathname: string): string {
  const raw = pathname.split("?")[0] ?? "/";
  if (raw === "/" || raw === "") return "/";
  return raw.replace(/\/+$/, "") || "/";
}

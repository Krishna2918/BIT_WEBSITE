export const SITE = {
  name: "BIT Solution",
  legalName: "BIT Solution",
  positioning:
    "Intelligent Infrastructure, Custom B2B Software & AI Workflows — Under One Flag.",
  tagline: "Your ONE stop IT solution.",
  trust: "Building Trust",
  phoneDisplay: "+1 905-867-6574",
  phoneTel: "+19058676574",
  phoneHref: "tel:+19058676574",
  address: "373 Steeles Ave W, Brampton, ON L6Y 0P8, Canada",
  region: "Ontario",
  coverage: "Entire Ontario",
  url: "https://bitsolution.ca",
} as const;

export const CANONICAL_PUBLIC_HOSTS = ["bitsolution.ca", "www.bitsolution.ca"] as const;

/** Every preview, Vercel, or unknown host stays noindex even if a flag is set. */
export const SITE_INDEXABLE =
  import.meta.env.VITE_SITE_INDEXABLE === "1" &&
  CANONICAL_PUBLIC_HOSTS.includes(
    String(import.meta.env.VITE_PUBLIC_HOSTNAME || "")
      .trim()
      .toLowerCase()
      .replace(/\.$/, "") as (typeof CANONICAL_PUBLIC_HOSTS)[number],
  );

import { CANONICAL_ORIGIN, KEEP_200 } from "@/data/legacy-migration";
import { INDUSTRIES } from "@/data/industries";
import { INSIGHTS } from "@/data/insights";
import { SITE } from "@/lib/site";
import { PRODUCTION_ROBOTS } from "@/data/robots-production";

export { CANONICAL_ORIGIN };

const PROD_HOSTS = new Set(["bitsolution.ca", "www.bitsolution.ca"]);

export function publicHost(): string {
  return String(import.meta.env.VITE_PUBLIC_HOSTNAME ?? "").replace(/:\d+$/, "").toLowerCase();
}

export function isProductionIndexable(): boolean {
  return PROD_HOSTS.has(publicHost());
}

export function robotsContent(noindex = false): string {
  if (!isProductionIndexable() || noindex) return "noindex, nofollow";
  return "index, follow";
}

export type PageSeo = {
  title: string;
  description: string;
  h1: string;
  noindex?: boolean;
};

export const PAGE_SEO: Record<string, PageSeo> = {
  "/": {
    title: "BIT Solution | Managed IT, software, hardware & AI in Ontario",
    description:
      "BIT Solution is your one-stop IT partner across Ontario. Software, hardware, AI, and security from Brampton HQ — book a consultation.",
    h1: "Intelligent infrastructure, custom B2B software & AI workflows — under one flag.",
  },
  "/software": {
    title: "Business software & custom builds | BIT Solution",
    description:
      "Fleet, college ERP, clinic, and vision software — or a custom build. BIT Solution designs systems for how Ontario floors already work.",
    h1: "Built for how people work now.",
  },
  "/hardware": {
    title: "Cameras, servers, PCs & phones | BIT Solution",
    description:
      "BIT puts the machines in place — cameras first, then private servers, workstations, network, and business phones across Ontario.",
    h1: "Software needs machines.",
  },
  "/ai": {
    title: "24/7 AI help with human handoff | BIT Solution",
    description:
      "BIT AI takes intake around the clock and a person steps in when they should. Available now vs coming soon, labeled honestly.",
    h1: "Help that stays on.",
  },
  "/security": {
    title: "Cybersecurity for Ontario businesses | BIT Solution",
    description:
      "Quiet protection around software, hardware, and AI — watch, lock, copy, recover. BIT Solution security for Ontario floors.",
    h1: "The layer that holds the rest.",
  },
  "/industries": {
    title: "Industries we cover | BIT Solution Ontario",
    description:
      "Transportation, dental, construction, warehouses, healthcare, and more. Software, hardware, AI, and security on every floor across Ontario.",
    h1: "Who we cover.",
  },
  "/consult": {
    title: "Book a consultation | BIT Solution",
    description:
      "Request a BIT Solution consultation. Ontario-wide IT — software, hardware, AI, and security. Call +1 905-867-6574.",
    h1: "Book a consultation",
  },
  "/privacy": {
    title: "Privacy notice | BIT Solution",
    description:
      "How BIT Solution collects consultation information under PIPEDA and CASL. We do not sell personal information.",
    h1: "Privacy notice",
  },
  "/faq": {
    title: "FAQs | BIT Solution Ontario IT",
    description:
      "What BIT Solution offers, how 24/7 support works, contracts, and Canadian cloud. Straight answers from the Ontario team.",
    h1: "Questions we get.",
  },
  "/insights": {
    title: "Insights | BIT Solution",
    description:
      "Notes on managed IT, cloud backup, and cybersecurity for Ontario businesses — no invented metrics.",
    h1: "From the floor.",
  },
  "/gallery": {
    title: "Gallery | BIT Solution",
    description:
      "Hardware, sectors, and the desk. Photos from floors BIT Solution walks in Ontario.",
    h1: "The floors we walk.",
  },
  "/images": {
    title: "Images | BIT Solution",
    description:
      "Service floors across Ontario — hardware, software, AI, security, and sector rooms on a moving map. Stock until client shots land.",
    h1: "Services across Ontario.",
  },
  "/support": {
    title: "IT support | BIT Solution",
    description:
      "24/7 support on +1 905-867-6574 or WhatsApp. Email support@bitsolution.ca. Human handoff when it is a person problem.",
    h1: "A person when it matters.",
  },
  "/ticket": {
    title: "Raise a ticket | BIT Solution",
    description:
      "Open a BIT Helpdesk ticket — short form or Ask AI. No phone number required. Call or WhatsApp +1 905-867-6574.",
    h1: "Raise a ticket.",
  },
  "/service-areas": {
    title: "Service areas across Ontario | BIT Solution",
    description:
      "BIT Solution covers all of Ontario from 373 Steeles Ave W, Brampton. Local pins plus the rest of the province.",
    h1: "Entire Ontario.",
  },
  "/digital-marketing": {
    title: "Digital marketing | BIT Solution",
    description:
      "SEO, local search, and content as an extra desk under the same BIT Solution flag — across Ontario.",
    h1: "Digital marketing.",
  },
  "/procurement": {
    title: "IT procurement | BIT Solution",
    description:
      "Sourcing and supplier desk for the stack you already run. BIT Solution procurement across Ontario.",
    h1: "Procurement.",
  },
  "/voip": {
    title: "VoIP & business phones | BIT Solution",
    description:
      "Business VoIP, meetings, and directory — phones that reach the right desk. BIT Solution across Ontario.",
    h1: "VoIP & phones.",
  },
  "/fleet-operations/ontario": {
    title: "Ontario fleet operations IT | BIT Solution",
    description:
      "Dispatch, cameras, and the shop stack for Ontario fleets. Book a BIT Solution consultation.",
    h1: "Keep the yard and the road on one stack.",
  },
  "/dental-it/ontario": {
    title: "Ontario dental IT | BIT Solution",
    description:
      "Charts, cameras, and PHIPA-aware IT for Ontario dental floors. Book a BIT Solution consultation.",
    h1: "The chair cannot wait on a frozen chart.",
  },
  "/login": {
    title: "Sign in | BIT Solution",
    description: "Staff sign-in for BIT Solution.",
    h1: "Sign in",
    noindex: true,
  },
  "/thank-you": {
    title: "Request received | BIT Solution",
    description: "Your BIT Solution consultation request was received.",
    h1: "We have your request.",
    noindex: true,
  },
  "/about-us": {
    title: "About BIT Solution | Ontario IT from Brampton",
    description:
      "BIT Solution is an Ontario IT company at 373 Steeles Ave W, Brampton. Software, hardware, AI, and security under one flag.",
    h1: "About BIT Solution.",
  },
  "/accessibility-statement": {
    title: "Accessibility | BIT Solution",
    description:
      "How to request an accessible version of BIT Solution pages or a consultation. Call +1 905-867-6574 or email info@bitsolution.ca.",
    h1: "Access this site.",
  },
  "/solutions": {
    title: "IT solutions | Software, hardware, AI & security — BIT Solution",
    description:
      "One team for software, hardware, AI, security, plus digital marketing, procurement, and VoIP. BIT Solution across Ontario.",
    h1: "Solutions under one flag.",
  },
  "/cloud-services-brampton": {
    title: "Cloud services in Brampton | BIT Solution Ontario",
    description:
      "Canadian private cloud, Microsoft 365, and backups you can restore. BIT Solution cloud from Brampton HQ across Ontario.",
    h1: "Cloud from Brampton.",
  },
  "/how-to-choose-a-managed-it-services-provider": {
    title: "How to choose a managed IT provider | BIT Solution",
    description:
      "What to ask before you hire managed IT in Ontario — one team, a human on the ticket, and a restore you have watched work.",
    h1: "How to choose a managed IT provider.",
  },
  "/cyber-security-tips-for-small-businesses": {
    title: "Cybersecurity tips for small businesses | BIT Solution",
    description:
      "The mistakes we still walk into on Ontario floors — shared logins, guest wifi, and copies you cannot restore.",
    h1: "Cybersecurity tips for small businesses.",
  },
  "/5-biggest-benefits-of-cloud-backups": {
    title: "5 benefits of cloud backups | BIT Solution",
    description:
      "Why Ontario businesses keep a copy off-site: fire, theft, restore tests, PIPEDA, and a second place to stand.",
    h1: "Five benefits of a cloud backup.",
  },
  "/10-signs-your-business-needs-managed-it-support": {
    title: "10 signs you need managed IT | BIT Solution",
    description:
      "Frozen charts, tickets that sit, and a vendor laptop on the plant net — signs an Ontario floor needs managed IT.",
    h1: "Ten signs you need managed IT.",
  },
  "/top-7-cyber-security-solutions-every-business-needs-in-2025": {
    title: "7 cybersecurity solutions for 2025 | BIT Solution",
    description:
      "Watch, edge stop, device lock, encrypted copies, recovery, training, and a split guest net — the shell BIT already runs.",
    h1: "Seven cybersecurity solutions every business needs.",
  },
};

for (const industry of INDUSTRIES) {
  PAGE_SEO[`/industries/${industry.slug}`] = {
    title: `${industry.name} IT in Ontario | BIT Solution`,
    description: `${industry.line} ${industry.complianceNote}`,
    h1: `${industry.name}.`,
  };
}

for (const insight of INSIGHTS) {
  PAGE_SEO[`/insights/${insight.slug}`] = {
    title: `${insight.title} | BIT Solution`,
    description: insight.excerpt,
    h1: insight.title,
  };
}

export function indexablePaths(): string[] {
  return Object.entries(PAGE_SEO)
    .filter(([, seo]) => !seo.noindex)
    .map(([path]) => path)
    .sort();
}

export function canonicalUrl(path: string): string {
  if (path === "/") return `${CANONICAL_ORIGIN}/`;
  return `${CANONICAL_ORIGIN}${path}`;
}

export function pageHead(path: string) {
  const seo = PAGE_SEO[path];
  const title = seo?.title ?? `${SITE.name}`;
  const description = seo?.description ?? SITE.positioning;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: robotsContent(seo?.noindex) },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalUrl(path) },
    ],
    links: [{ rel: "canonical", href: canonicalUrl(path) }],
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE.name,
    legalName: SITE.legalName,
    telephone: SITE.phoneTel,
    email: SITE.email,
    url: CANONICAL_ORIGIN,
    image: `${CANONICAL_ORIGIN}/og.jpg`,
    description: SITE.positioning,
    areaServed: { "@type": "AdministrativeArea", name: "Ontario, Canada" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "373 Steeles Ave W",
      addressLocality: "Brampton",
      addressRegion: "ON",
      postalCode: "L6Y 0P8",
      addressCountry: "CA",
    },
    sameAs: [CANONICAL_ORIGIN],
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function articleJsonLd(opts: { title: string; description: string; path: string; date?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    datePublished: opts.date,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name, url: CANONICAL_ORIGIN },
    mainEntityOfPage: canonicalUrl(opts.path),
  };
}

export function sitemapXml(): string {
  const urls = indexablePaths()
    .map((path) => `  <url><loc>${canonicalUrl(path)}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function robotsTxt(preview: boolean): string {
  if (preview) {
    return `User-agent: *
Disallow: /

# Preview hosts stay dark. Production robots ship after domain cutover.
`;
  }
  return PRODUCTION_ROBOTS;
}

export const LEGACY_KEEP = KEEP_200;

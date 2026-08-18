import { Link } from "@tanstack/react-router";
import { INDUSTRIES } from "@/data/industries";
import { SITE } from "@/lib/site";

const COLS = [
  {
    title: "Explore",
    links: [
      { to: "/software", label: "Software" },
      { to: "/hardware", label: "Hardware" },
      { to: "/ai", label: "AI" },
      { to: "/security", label: "Security" },
    ],
  },
  {
    title: "Also",
    links: [
      { to: "/digital-marketing", label: "Digital marketing" },
      { to: "/procurement", label: "Procurement" },
      { to: "/voip", label: "VoIP & phones" },
      { to: "/industries", label: "Sectors" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about-us", label: "About" },
      { to: "/solutions", label: "Solutions" },
      { to: "/service-areas", label: "Service areas" },
      { to: "/insights", label: "Insights" },
      { to: "/gallery", label: "Gallery" },
      { to: "/faq", label: "FAQs" },
      { to: "/support", label: "Support" },
    ],
  },
  {
    title: "Contact",
    links: [
      { to: "/consult", label: "Book consultation" },
      { to: "/privacy", label: "Privacy" },
      { to: "/accessibility-statement", label: "Accessibility" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-bg-muted text-muted">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <p className="mb-3 text-[13px] font-medium text-ink">
          Intelligent Infrastructure, Custom B2B Software & AI Workflows —
          Under One Flag.
        </p>
        <p className="mb-2 text-[12px] leading-5">
          <a className="callrail rTapNumber text-ink no-underline" href={SITE.phoneHref}>
            {SITE.phoneDisplay}
          </a>
          {" · "}
          <a
            className="text-ink no-underline"
            href={SITE.whatsappHref}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          {" · "}
          <a className="text-ink no-underline" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
          {" · "}
          {SITE.address}
        </p>
        <p className="mb-8 text-[12px] leading-5">
          Your ONE stop IT solution. BIT Solution connects software, hardware,
          AI, security, digital marketing, procurement, and VoIP for every
          sector we cover — across all of Ontario, from Brampton HQ.
        </p>
        <div className="grid grid-cols-2 gap-8 border-t border-hairline pt-8 sm:grid-cols-4">
          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-2 text-[12px] font-semibold text-ink">{col.title}</h3>
              <ul className="space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-[12px] text-muted no-underline hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-t border-hairline pt-6">
          {INDUSTRIES.map((item) => (
            <Link
              key={item.slug}
              to="/industries/$slug"
              params={{ slug: item.slug }}
              className="text-[12px] text-muted no-underline hover:underline"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <p className="mt-10 text-[11px] text-muted">
          Copyright © {new Date().getFullYear()} BIT Solution. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

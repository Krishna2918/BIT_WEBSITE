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
      { to: "/gallery", label: "Gallery" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about-us", label: "About" },
      { to: "/solutions", label: "Solutions" },
      { to: "/insights", label: "Insights" },
      { to: "/support", label: "Support" },
    ],
  },
  {
    title: "Contact",
    links: [
      { to: "/consult", label: "Book consultation" },
      { to: "/ticket", label: "Raise a ticket" },
      { to: "/faq", label: "FAQs" },
      { to: "/service-areas", label: "Service areas" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-brand">
          Intelligent Infrastructure — Under One Flag.
        </p>
        <p className="site-footer-meta">
          <a className="callrail rTapNumber" href={SITE.phoneHref}>
            {SITE.phoneDisplay}
          </a>
          <span>·</span>
          <a href={SITE.whatsappHref} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <span>·</span>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <span>·</span>
          {SITE.address}
        </p>
        <div className="site-footer-cols">
          {COLS.map((col) => (
            <div key={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="site-footer-sectors">
          <span>Sectors</span>
          {INDUSTRIES.map((item) => (
            <Link
              key={item.slug}
              to="/industries/$slug"
              params={{ slug: item.slug }}
            >
              {item.name}
            </Link>
          ))}
        </p>
        <p className="site-footer-copy">
          Copyright © {new Date().getFullYear()} BIT Solution.
          {" · "}
          <Link to="/privacy">Privacy</Link>
          {" · "}
          <Link to="/accessibility-statement">Accessibility</Link>
        </p>
      </div>
    </footer>
  );
}

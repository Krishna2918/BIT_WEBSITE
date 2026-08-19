import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { INDUSTRIES } from "@/data/industries";
import { SITE } from "@/lib/site";
import { openConsentPreferences } from "@/lib/consent";

const COLS = [
  {
    title: "Core services",
    links: [
      { to: "/software", label: "Software" },
      { to: "/hardware", label: "Hardware" },
      { to: "/ai", label: "AI" },
      { to: "/security", label: "Security" },
    ],
  },
  {
    title: "Business services",
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
      { to: "/service-areas", label: "Service areas" },
      { to: "/insights", label: "Insights" },
      { to: "/gallery", label: "Gallery" },
      { to: "/faq", label: "FAQs" },
      { to: "/support", label: "Support" },
      { to: "/ticket", label: "IT ticket" },
    ],
  },
  {
    title: "Contact",
    links: [{ to: "/consult", label: "Book consultation" }],
  },
] as const;

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="site-footer site-footer--compact">
        <div className="site-footer-inner site-footer-compact-inner">
          <div className="site-footer-compact-help">
            <span>Need help booking?</span>
            <a className="callrail rTapNumber" href={SITE.phoneHref}>
              <Phone aria-hidden="true" size={18} />
              <span>Call {SITE.phoneDisplay}</span>
            </a>
          </div>
          <div className="site-footer-compact-legal">
            <span>Copyright © {new Date().getFullYear()} BIT Solution.</span>
            <Link to="/privacy">Privacy</Link>
            <button type="button" onClick={openConsentPreferences}>
              Cookie preferences
            </button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <section className="site-footer-brand" aria-labelledby="footer-value-heading">
          <h2 id="footer-value-heading">
            Intelligent Infrastructure, Custom B2B Software & AI Workflows — Under One Flag.
          </h2>
          <p>
            Your ONE stop IT solution. BIT Solution connects software, hardware, AI,
            security, digital marketing, procurement, and VoIP across Ontario from
            Brampton HQ.
          </p>
          <address className="site-footer-contact" aria-label="BIT Solution contact details">
            <a className="callrail rTapNumber" href={SITE.phoneHref}>
              <Phone aria-hidden="true" size={18} />
              <span>{SITE.phoneDisplay}</span>
            </a>
            <a href={SITE.whatsappHref} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" size={18} />
              <span>WhatsApp</span>
            </a>
            <a href={`mailto:${SITE.email}`}>
              <Mail aria-hidden="true" size={18} />
              <span>{SITE.email}</span>
            </a>
            <span>
              <MapPin aria-hidden="true" size={18} />
              <span>{SITE.address}</span>
            </span>
          </address>
        </section>

        <nav className="site-footer-nav" aria-label="Footer navigation">
          {COLS.map((col) => (
            <section key={col.title}>
              <h2>{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <section className="site-footer-sectors" aria-labelledby="footer-sectors-heading">
          <h2 id="footer-sectors-heading">Sectors</h2>
          <ul>
            {INDUSTRIES.map((item) => (
              <li key={item.slug}>
                <Link to="/industries/$slug" params={{ slug: item.slug }}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="site-footer-legal">
          <span>Copyright © {new Date().getFullYear()} BIT Solution. All rights reserved.</span>
          <div>
            <Link to="/privacy">Privacy</Link>
            <button type="button" onClick={openConsentPreferences}>
              Cookie preferences
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

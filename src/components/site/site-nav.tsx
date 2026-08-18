import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { SITE } from "@/lib/site";

const LINKS = [
  { to: "/software", label: "Software" },
  { to: "/hardware", label: "Hardware" },
  { to: "/ai", label: "AI" },
  { to: "/security", label: "Security" },
  { to: "/industries", label: "Sectors" },
] as const;

const linkClass =
  "text-[13px] tracking-[0.01em] text-nav-muted no-underline transition-colors duration-150 hover:text-white";

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-12 border-b border-white/10 bg-[#0e0e10]/90 text-nav-fg backdrop-blur-xl">
      <div className="relative mx-auto flex h-full max-w-6xl items-center gap-3 px-5">
        <Link
          to="/"
          className="relative z-10 flex shrink-0 items-center gap-2.5 text-nav-fg no-underline"
          onClick={() => setOpen(false)}
        >
          <img
            src="/images/bit-mark-official.png"
            alt=""
            className="h-6 w-6 object-contain"
          />
          <span className="text-[12px] font-semibold tracking-[0.14em] text-white">
            BIT SOLUTION
          </span>
        </Link>

        <nav className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
          <div className="pointer-events-auto flex items-center gap-7">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={linkClass}
                activeProps={{ className: `${linkClass} text-white` }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <a
            href={SITE.phoneHref}
            className="nav-phone cta-ghost cta-ghost--nav"
          >
            {SITE.phoneDisplay}
          </a>
          <a
            href={SITE.phoneHref}
            className="cta-book cta-book--nav"
          >
            Call now
          </a>
          <button
            type="button"
            className="inline-flex h-12 w-11 items-center justify-center text-nav-fg lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#0e0e10] lg:hidden">
          <nav className="flex flex-col px-5 py-2">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex h-12 items-center text-[15px] text-white no-underline"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="cta-pair justify-start py-3">
              <a
                href={SITE.phoneHref}
                className="cta-ghost cta-ghost--nav"
              >
                {SITE.phoneDisplay}
              </a>
              <a
                href={SITE.phoneHref}
                className="cta-book"
              >
                Call now
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

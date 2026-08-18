import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";

export function LpHeader() {
  return (
    <header className="lp-bar">
      <Link to="/" className="lp-brand" aria-label="BIT Solution home">
        <img src="/images/bit-mark-official.png" alt="" width={28} height={28} />
        <span>BIT SOLUTION</span>
      </Link>
      <div className="lp-actions">
        <a
          className="lp-phone"
          href={SITE.phoneHref}
        >
          {SITE.phoneDisplay}
        </a>
        <a
          className="lp-book"
          href={SITE.phoneHref}
        >
          Call now
        </a>
      </div>
    </header>
  );
}

export function LpFooter() {
  return (
    <footer className="lp-foot">
      <p>
        {SITE.name} · {SITE.address}
      </p>
      <p>
        <a href={SITE.phoneHref}>
          {SITE.phoneDisplay}
        </a>
        {" · "}
        <Link to="/privacy">Privacy</Link>
      </p>
      <p className="lp-fine">
        {SITE.positioning} No testimonials or performance claims are shown here
        that we cannot verify.
      </p>
    </footer>
  );
}

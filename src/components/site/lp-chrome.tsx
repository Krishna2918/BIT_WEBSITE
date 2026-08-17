import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { track } from "@/lib/tracking";

export function LpHeader({ consultTo = "/consult" }: { consultTo?: string }) {
  return (
    <header className="lp-bar">
      <Link to="/" className="lp-brand" aria-label="BIT Solution home">
        <img src="/images/bit-mark-official.png" alt="" width={28} height={28} />
        <span>BIT SOLUTION</span>
      </Link>
      <div className="lp-actions">
        <a
          className="lp-phone callrail rTapNumber"
          href={SITE.phoneHref}
          onClick={() => track("click_to_call", { source: "lp-header" })}
        >
          {SITE.phoneDisplay}
        </a>
        <a
          className="lp-book"
          href={consultTo}
          onClick={() => track("book_consult_click", { source: "lp-header" })}
        >
          Book consultation
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
        <a className="callrail rTapNumber" href={SITE.phoneHref}>
          {SITE.phoneDisplay}
        </a>
        {" · "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
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

import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { track } from "@/lib/tracking";

export function ContactActions({ source }: { source: string }) {
  return (
    <div className="cta-pair justify-start">
      <Link
        to="/consult"
        className="cta-book"
        onClick={() => track("book_consult_click", { source })}
      >
        Book consultation
      </Link>
      <a
        href={SITE.phoneHref}
        className="cta-ghost callrail rTapNumber"
        onClick={() => track("click_to_call", { source })}
      >
        {SITE.phoneDisplay}
      </a>
      <a
        href={SITE.whatsappHref}
        className="cta-ghost"
        target="_blank"
        rel="noreferrer"
        onClick={() => track("whatsapp_click", { source })}
      >
        WhatsApp
      </a>
    </div>
  );
}

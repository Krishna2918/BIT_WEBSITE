import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { track } from "@/lib/tracking";
import { ContactActions } from "@/components/site/contact-actions";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () => pageHead("/support"),
});

function SupportPage() {
  return (
    <main className="bg-bg">
      <section className="page-band">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Support
        </p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          A person when it matters.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
          24/7 across Ontario. Same number for a call and for WhatsApp. Existing
          clients and anyone who needs the desk.
        </p>
      </section>

      <section className="mx-auto grid max-w-3xl gap-3 px-5 pb-16 sm:grid-cols-2">
        <a
          href={SITE.phoneHref}
          className="support-card"
          onClick={() => track("click_to_call", { source: "support" })}
        >
          <p className="support-kicker">Call · 24/7</p>
          <h2>Phone</h2>
          <p className="callrail rTapNumber">{SITE.phoneDisplay}</p>
        </a>
        <a
          href={SITE.whatsappHref}
          className="support-card"
          target="_blank"
          rel="noreferrer"
          onClick={() => track("whatsapp_click", { source: "support" })}
        >
          <p className="support-kicker">WhatsApp · 24/7</p>
          <h2>Message</h2>
          <p>{SITE.whatsappDisplay}</p>
        </a>
        <a
          href={`mailto:${SITE.supportEmail}`}
          className="support-card"
          onClick={() => track("email_click", { source: "support" })}
        >
          <p className="support-kicker">Email</p>
          <h2>Support inbox</h2>
          <p>{SITE.supportEmail}</p>
        </a>
        <Link
          to="/ticket"
          className="support-card"
          onClick={() => track("ticket_click", { source: "support" })}
        >
          <p className="support-kicker">Clients</p>
          <h2>Raise a ticket</h2>
          <p>Short form or Ask AI. BIT Helpdesk sees it.</p>
        </Link>
      </section>

      <section className="border-t border-hairline bg-bg-muted px-5 py-16 text-center">
        <p className="text-[21px] text-ink">Emergency after hours</p>
        <p className="mx-auto mt-2 max-w-lg text-[16px] leading-relaxed text-muted">
          Same number. {SITE.phoneDisplay}. We do not publish a second line.
        </p>
        <div className="mt-6 flex justify-center">
          <ContactActions source="support-emergency" />
        </div>
        <p className="mt-8 text-[14px] text-muted">
          <Link to="/faq" className="text-link no-underline hover:underline">
            FAQs ›
          </Link>
          {" · "}
          <Link to="/privacy" className="text-link no-underline hover:underline">
            Privacy ›
          </Link>
        </p>
      </section>
    </main>
  );
}

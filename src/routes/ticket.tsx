import { createFileRoute, Link } from "@tanstack/react-router";
import { TicketDesk } from "@/components/site/ticket-desk";
import { SITE } from "@/lib/site";
import { track } from "@/lib/tracking";
import { pageHead } from "@/lib/seo";

type Search = { from?: string };

export const Route = createFileRoute("/ticket")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    from: typeof s.from === "string" ? s.from : undefined,
  }),
  component: TicketPage,
  head: () => pageHead("/ticket"),
});

function TicketPage() {
  const { from } = Route.useSearch();
  const fromWhatsapp = from === "whatsapp";

  return (
    <main className="bg-bg">
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-16">
        <p className="mb-2 text-center text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Support
        </p>
        <h1 className="text-center text-[clamp(1.8rem,5vw,2.8rem)] font-semibold tracking-[-0.03em] text-ink">
          Raise a ticket.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-relaxed text-muted">
          Short form or Ask AI. Same BIT Helpdesk. Do not send passwords. We do
          not ask for a phone number here — call or WhatsApp if you want a person now.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[14px]">
          <a
            className="text-link no-underline hover:underline callrail rTapNumber"
            href={SITE.phoneHref}
            onClick={() => track("click_to_call", { source: "ticket" })}
          >
            Call {SITE.phoneDisplay}
          </a>
          <a
            className="text-link no-underline hover:underline"
            href={SITE.whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("whatsapp_click", { source: "ticket" })}
          >
            WhatsApp
          </a>
          <a
            className="text-link no-underline hover:underline"
            href={`mailto:${SITE.supportEmail}`}
            onClick={() => track("email_click", { source: "ticket" })}
          >
            {SITE.supportEmail}
          </a>
          <Link
            to="/consult"
            className="text-link no-underline hover:underline"
            onClick={() => track("book_consult_click", { source: "ticket" })}
          >
            Book consultation
          </Link>
        </div>
        <div className="mt-10">
          <TicketDesk fromWhatsapp={fromWhatsapp} />
        </div>
      </section>
    </main>
  );
}

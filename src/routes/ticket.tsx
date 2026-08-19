import { createFileRoute } from "@tanstack/react-router";
import { TicketForm } from "@/components/site/ticket-form";
import { SITE, SITE_INDEXABLE } from "@/lib/site";
import { track } from "@/lib/tracking";

export const Route = createFileRoute("/ticket")({
  component: TicketPage,
  head: () => ({
    meta: [
      { title: "Raise a ticket — BIT Solution" },
      {
        name: "description",
        content:
          "Raise an IT ticket with BIT Solution. Company, work email, and what broke. Call or WhatsApp +1 905-867-6574.",
      },
      {
        name: "robots",
        content: SITE_INDEXABLE ? "index,follow" : "noindex,nofollow,noarchive",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/ticket` }],
  }),
});

function TicketPage() {
  return (
    <main className="bg-bg">
      <section className="mx-auto max-w-xl px-5 pb-20 pt-16">
        <p className="mb-2 text-center text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Support
        </p>
        <h1 className="text-center text-[clamp(1.8rem,5vw,2.8rem)] font-semibold tracking-[-0.03em] text-ink">
          Raise a ticket
        </h1>
        <p className="mx-auto mt-3 max-w-md text-center text-[16px] leading-relaxed text-muted">
          Company, work email, and what broke. A person in BIT Helpdesk takes it. Do not send
          passwords.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-[14px]">
          <a
            className="text-link no-underline hover:underline"
            href={SITE.whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("whatsapp_click", { source: "ticket" })}
          >
            WhatsApp {SITE.whatsappDisplay}
          </a>
          <a
            className="text-link no-underline hover:underline callrail rTapNumber"
            href={SITE.phoneHref}
            onClick={() => track("click_to_call", { source: "ticket" })}
          >
            Call {SITE.phoneDisplay}
          </a>
        </div>
        <div className="mt-10">
          <TicketForm source="ticket-page" />
        </div>
      </section>
    </main>
  );
}

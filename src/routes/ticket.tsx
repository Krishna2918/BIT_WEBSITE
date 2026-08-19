import { createFileRoute } from "@tanstack/react-router";
import { SITE, SITE_INDEXABLE } from "@/lib/site";

export const Route = createFileRoute("/ticket")({
  component: TicketPage,
  head: () => ({
    meta: [
      { title: "IT ticket — BIT Solution" },
      {
        name: "description",
        content: "Open an IT ticket with BIT Solution. AI sorts the work. BIT Helpdesk approves before any PC access.",
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
  const desk = SITE.ticketUrl || "https://win-9jicvuobmun.tail9e2ebd.ts.net/ticket";
  return (
    <main className="bg-bg">
      <section className="mx-auto max-w-xl px-5 pb-20 pt-16">
        <p className="mb-2 text-center text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Support ticket
        </p>
        <h1 className="text-center text-[clamp(1.8rem,5vw,2.8rem)] font-semibold tracking-[-0.03em] text-ink">
          Get IT help
        </h1>
        <p className="mx-auto mt-3 max-w-md text-center text-[16px] leading-relaxed text-muted">
          Tell us who you are and what broke. BIT OS sorts client, work, and urgency. A person in BIT
          Helpdesk types @ai approved before any PC work. Screen control is last.
        </p>
        <p className="mx-auto mt-6 text-center text-[14px] text-muted">
          Ticket desk is on the BIT OS operator. Open the form:
        </p>
        <p className="mt-4 text-center">
          <a className="cta-book" href={desk}>
            Open ticket form
          </a>
        </p>
        <p className="mx-auto mt-6 max-w-md text-center text-[13px] text-muted">
          Call or WhatsApp {SITE.phoneDisplay} if it is urgent. Do not send passwords here.
        </p>
      </section>
    </main>
  );
}

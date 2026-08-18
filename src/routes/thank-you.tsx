import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";

type Search = { intent?: string };

export const Route = createFileRoute("/thank-you")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    intent: typeof s.intent === "string" ? s.intent : undefined,
  }),
  component: ThankYou,
  head: () => ({
    meta: [{ title: "Request received — BIT Solution" }, { name: "robots", content: "noindex" }],
  }),
});

function ThankYou() {
  const { intent } = Route.useSearch();
  return (
    <main className="bg-bg">
      <section className="mx-auto max-w-lg px-5 py-24 text-center">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Received
        </p>
        <h1 className="text-[clamp(1.8rem,5vw,2.6rem)] font-semibold tracking-[-0.03em] text-ink">
          Thanks—BIT Solution will review your request and contact you at your preferred time.
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          If your request is urgent, call{" "}
          <a className="callrail rTapNumber text-link" href={SITE.phoneHref}>
            {SITE.phoneDisplay}
          </a>
          .
        </p>
        {intent === "fleet" ? (
          <p className="mt-6">
            <a className="text-link" href="/downloads/mto-fleet-checklist.pdf">
              Download the Ontario fleet checklist ›
            </a>
          </p>
        ) : null}
        {intent === "dental" ? (
          <p className="mt-6">
            <a className="text-link" href="/downloads/dental-phipa-self-audit.pdf">
              Download the PHIPA self-audit ›
            </a>
          </p>
        ) : null}
        <p className="mt-10">
          <Link to="/" className="text-link">
            Back to BIT Solution ›
          </Link>
        </p>
      </section>
    </main>
  );
}

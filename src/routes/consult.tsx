import { createFileRoute } from "@tanstack/react-router";
import { SITE, SITE_INDEXABLE } from "@/lib/site";

export const Route = createFileRoute("/consult")({
  component: ConsultPage,
  head: () => ({
    meta: [
      { title: "Call BIT Solution" },
      {
        name: "description",
        content: `Call BIT Solution at ${SITE.phoneDisplay} to discuss technology services across Ontario.`,
      },
      {
        name: "robots",
        content: SITE_INDEXABLE ? "index,follow" : "noindex,nofollow,noarchive",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/consult` }],
  }),
});

function ConsultPage() {
  return (
    <main className="bg-bg">
      <section className="mx-auto max-w-xl px-5 pb-20 pt-16 text-center">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Contact
        </p>
        <h1 className="text-[clamp(1.8rem,5vw,2.8rem)] font-semibold tracking-[-0.03em] text-ink">
          Call BIT Solution
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-muted">
          Tell us what you need by phone. We serve businesses across Ontario and will discuss the
          right next step without collecting information through this website.
        </p>
        <p className="mt-8">
          <a className="cta-book" href={SITE.phoneHref}>
            Call {SITE.phoneDisplay}
          </a>
        </p>
        <p className="mt-8 text-[14px] leading-relaxed text-muted">{SITE.address}</p>
      </section>
    </main>
  );
}

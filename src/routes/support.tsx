import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () => ({
    links: [canonicalLink("/support")],
    meta: [
      { title: "Support — BIT Solution" },
      { name: "description", content: `Call BIT Solution support at ${SITE.phoneDisplay}.` },
    ],
  }),
});

function SupportPage() {
  return (
    <main className="bg-bg">
      <section className="px-5 pb-10 pt-16 text-center">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Support
        </p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          A person when it matters.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
          This informational release uses phone inquiries only. Call the number below for support
          or to discuss a service request.
        </p>
        <p className="mt-8">
          <a href={SITE.phoneHref} className="cta-book">
            Call {SITE.phoneDisplay}
          </a>
        </p>
      </section>

      <section className="border-t border-hairline bg-bg-muted px-5 py-16 text-center">
        <p className="text-[21px] text-ink">BIT Solution</p>
        <p className="mx-auto mt-2 max-w-lg text-[16px] leading-relaxed text-muted">
          {SITE.address}
        </p>
        <p className="mt-8 text-[14px] text-muted">
          <Link to="/faq" className="text-link no-underline hover:underline">FAQs ›</Link>
          {" · "}
          <Link to="/privacy" className="text-link no-underline hover:underline">Privacy ›</Link>
        </p>
      </section>
    </main>
  );
}

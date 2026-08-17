import { createFileRoute } from "@tanstack/react-router";
import { ConsultForm } from "@/components/site/consult-form";
import { SITE } from "@/lib/site";
import { track } from "@/lib/tracking";

export const Route = createFileRoute("/consult")({
  component: ConsultPage,
  head: () => ({
    meta: [
      { title: "Book a consultation — BIT Solution" },
      {
        name: "description",
        content:
          "Book a consultation with BIT Solution. Intelligent infrastructure across all of Ontario. Call or WhatsApp +1 905-867-6574.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
});

function ConsultPage() {
  return (
    <main className="bg-bg">
      <section className="mx-auto max-w-xl px-5 pb-20 pt-16">
        <p className="mb-2 text-center text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Consultation
        </p>
        <h1 className="text-center text-[clamp(1.8rem,5vw,2.8rem)] font-semibold tracking-[-0.03em] text-ink">
          Book a consultation
        </h1>
        <p className="mx-auto mt-3 max-w-md text-center text-[16px] leading-relaxed text-muted">
          {SITE.positioning} Tell us about the floor. We cover all of Ontario.
          We will call you from {SITE.phoneDisplay}.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-[14px]">
          <a className="text-link no-underline hover:underline callrail rTapNumber" href={SITE.phoneHref}>
            Call
          </a>
          <a
            className="text-link no-underline hover:underline"
            href={SITE.whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("whatsapp_click", { source: "consult" })}
          >
            WhatsApp
          </a>
          <a className="text-link no-underline hover:underline" href={`mailto:${SITE.email}`}>
            Email
          </a>
        </div>
        <div className="mt-10">
          <ConsultForm intent="general" source="consult-page" />
        </div>
      </section>
    </main>
  );
}
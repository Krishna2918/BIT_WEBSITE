import { createFileRoute } from "@tanstack/react-router";
import { ConsultForm } from "@/components/site/consult-form";
import { SITE } from "@/lib/site";
import { track } from "@/lib/tracking";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/consult")({
  component: ConsultPage,
  head: () => pageHead("/consult"),
});

function ConsultPage() {
  return (
    <main className="bg-bg">
      <section className="page-band">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Consultation
        </p>
        <h1 className="text-[clamp(1.8rem,5vw,2.8rem)] font-semibold tracking-[-0.03em]">
          Book a consultation
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[16px] leading-relaxed">
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
      </section>
      <section className="mx-auto max-w-xl px-5 py-14">
        <ConsultForm intent="general" source="consult-page" />
      </section>
    </main>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { FAQS } from "@/data/faqs";
import { ContactActions } from "@/components/site/contact-actions";
import { pageHead, faqJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => pageHead("/faq"),
});

function FaqPage() {
  return (
    <main className="bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />
      <section className="page-band">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Help
        </p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          Questions we get.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
          Straight answers. If yours is not here, call or WhatsApp — 24/7.
        </p>
      </section>
      <section className="mx-auto max-w-2xl px-5 pb-16">
        {FAQS.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
        <div className="mt-12">
          <ContactActions source="faq" />
        </div>
      </section>
    </main>
  );
}

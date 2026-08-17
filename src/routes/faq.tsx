import { createFileRoute } from "@tanstack/react-router";
import { FAQS } from "@/data/faqs";
import { ContactActions } from "@/components/site/contact-actions";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQs — BIT Solution" },
      {
        name: "description",
        content:
          "Common questions about BIT Solution IT services, 24/7 support, contracts, and Canadian cloud.",
      },
    ],
  }),
});

function FaqPage() {
  return (
    <main className="bg-bg">
      <section className="px-5 pb-8 pt-16 text-center">
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

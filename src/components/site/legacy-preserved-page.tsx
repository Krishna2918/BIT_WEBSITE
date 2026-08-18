import { Link } from "@tanstack/react-router";
import { ContactActions } from "@/components/site/contact-actions";

export type LegacyPageContent = {
  eyebrow: string;
  title: string;
  summary: string;
  sections: Array<{ title: string; body: string }>;
};

export function LegacyPreservedPage({ page }: { page: LegacyPageContent }) {
  return (
    <main className="bg-bg">
      <article className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          {page.eyebrow}
        </p>
        <h1 className="mt-3 text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-ink">
          {page.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-muted">{page.summary}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {page.sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-hairline bg-panel p-6">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
                {section.title}
              </h2>
              <p className="mt-3 text-[16px] leading-relaxed text-muted">{section.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-12 border-t border-hairline pt-8">
          <ContactActions source="legacy-preserved-page" />
          <p className="mt-6">
            <Link to="/" className="text-[15px] text-link no-underline hover:underline">
              Back to BIT Solution ›
            </Link>
          </p>
        </div>
      </article>
    </main>
  );
}

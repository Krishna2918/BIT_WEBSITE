import { Link } from "@tanstack/react-router";
import { ContactActions } from "@/components/site/contact-actions";
import { PAGE_SEO, faqJsonLd, breadcrumbJsonLd, articleJsonLd } from "@/lib/seo";
import type { LegacyPage } from "@/data/legacy-pages";

export function SeoArticle({ page }: { page: LegacyPage }) {
  const seo = PAGE_SEO[page.path];
  const json = [
    breadcrumbJsonLd(page.crumbs),
    faqJsonLd(page.faqs),
    page.kind === "article"
      ? articleJsonLd({
          title: seo?.title ?? page.path,
          description: seo?.description ?? page.lede,
          path: page.path,
          date: page.date,
        })
      : null,
  ].filter(Boolean);

  return (
    <main className="bg-bg">
      {json.map((block, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      <article className="mx-auto max-w-2xl px-5 py-16">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          {page.kicker}
        </p>
        {page.date ? (
          <p className="text-[13px] text-muted">
            {new Date(page.date).toLocaleDateString("en-CA", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        ) : null}
        <h1 className="mt-2 text-[clamp(1.8rem,5vw,2.6rem)] font-semibold tracking-[-0.03em] text-ink">
          {seo?.h1 ?? page.path}
        </h1>
        <p className="mt-4 text-[18px] leading-relaxed text-muted">{page.lede}</p>
        {page.blocks.map((block) => (
          <div key={(block.h2 ?? "") + block.p.slice(0, 24)} className="mt-8">
            {block.h2 ? (
              <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{block.h2}</h2>
            ) : null}
            <p className={block.h2 ? "mt-2 text-[17px] leading-relaxed text-muted" : "text-[17px] leading-relaxed text-muted"}>
              {block.p}
            </p>
          </div>
        ))}
        {page.faqs.length > 0 ? (
          <section className="mt-12 border-t border-hairline pt-8">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">Questions</h2>
            {page.faqs.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </section>
        ) : null}
        <p className="mt-10 text-[13px] leading-relaxed text-muted">{page.disclosure}</p>
        <div className="mt-10 border-t border-hairline pt-8">
          <ContactActions source={`legacy-${page.path}`} />
          <p className="mt-6">
            <Link to="/" className="text-[15px] text-link no-underline hover:underline">
              Home ›
            </Link>
          </p>
        </div>
      </article>
    </main>
  );
}
